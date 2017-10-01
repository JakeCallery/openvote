const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const VoteManager = require('../managers/VoteManager');
const ClientsManager = require('../managers/ClientsManager');

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

            let resObj = {
                status:'SUCCESS'
            };

            resObj.data = {
                voteId: vote.properties.voteId,
                topicId: topic.properties.topicId,
                topicName: topic.properties.topicName
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