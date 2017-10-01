const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const VoteManager = require('../managers/VoteManager');
const ClientsManager = require('../managers/ClientsManager');
const neo4j = require('neo4j-driver').v1;

router.post('/', (req, res) => {
    console.log('Caught Cast Vote Request');

    let cm = new ClientsManager(null);

    promiseRetry((retry, attempt) => {
        console.log('Cast Vote Attempt: ' + attempt);

        //TODO: Sanitize req inputs
        return VoteManager.castVote(req.body.topicId)
        .then(($dbResult) => {
            console.log('Cast Vote DBResult: ' + $dbResult);

            let vote = $dbResult.records[0].get('vote');
            let topic = $dbResult.records[0].get('topic');
            let voteCount = $dbResult.records[0].get('voteCount');
            voteCount = neo4j.int(voteCount);

            let resObj = {
                status:'SUCCESS'
            };

            if(neo4j.integer.inSafeRange(voteCount)){
                voteCount = voteCount.toNumber();
            } else {
                console.error('INT overrun / vote count too big for topic: ' + topic.properties.topicId + ' / ' + topic.properties.topicName);
                //TODO: Gracefully handle this issue on the client
                resObj.status = 'ERROR';
                resObj.error = 'Vote count for topic too high (int too big for JS)';
                res.status(500).json(resObj);
                return;
            }

            resObj.data = {
                voteId: vote.properties.voteId,
                topicId: topic.properties.topicId,
                topicName: topic.properties.topicName,
                voteCount: voteCount
            };

            console.log('Source Connection Id: ', req.body.connectionId);
            cm.notifyClientsOfVote(req.body.connectionId, resObj.data);
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            if ($error.fields[0].code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                console.log('duplicate vote id, retrying: ' + attempt);
                retry('cast vote duplicate id');
            } else {
                console.error('Cast Vote Failed: ', $error);
                let resObj = {
                    error: $error,
                    status: 'ERROR'
                };
                res.status(400).json(resObj);
            }
        });
    },{retries:3})
    .catch(($error) => {
        console.error('Cast Vote Failed: ' + $error);
        let resObj = {
            error: $error,
            status: 'ERROR'
        };
        res.status(400).json(resObj);
    });

});

module.exports = router;