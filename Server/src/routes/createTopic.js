const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const TopicManager = require('../managers/TopicManager');
const VoteManager = require('../managers/VoteManager');
const ClientsManager = require('../managers/ClientsManager');
const neo4j = require('neo4j-driver').v1;

const MAX_TOPIC_NAME_LENGTH = 200;

router.post('/', (req, res) => {
    let cm = new ClientsManager(null);

    promiseRetry((retry, attempt) => {
        //Limit topic size:
        if(req.body.topicName.length > MAX_TOPIC_NAME_LENGTH){
            console.error('Topic Name Sent too long, truncating...:' + req.body.topicName.length);
        }

        let topic = req.body.topicName.substring(0, MAX_TOPIC_NAME_LENGTH);

        return TopicManager.createTopic(req.body.topicName)
        .then(($dbResult) => {
            let topic = $dbResult.records[0].get('topic');

            let resObj = {
                status:'SUCCESS'
            };

            resObj.data = {
                topicId: topic.properties.topicId,
                topicName: topic.properties.topicName
            };

            //Create initial vote for new topic
            return VoteManager.castVote(topic.properties.topicId)
        })
        .then(($dbResult) => {
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

            cm.notifyClientsOfTopic(req.body.connectionId, resObj.data);
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            if ($error.fields[0].code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                console.error('duplicate topic id, retrying: ' + attempt);
                retry('create topic duplicate id');
            } else {
                console.error('Create Topic Failed: ', $error);
                let resObj = {
                    error: $error,
                    status: 'ERROR'
                };
                res.status(400).json(resObj);
            }
        });
    },{retries:3})
    .catch(($error) => {
        console.error('Create Topic Failed: ' + $error);
        let resObj = {
            error: $error,
            status: 'ERROR'
        };

        res.status(400).json(resObj);
    });

});

module.exports = router;