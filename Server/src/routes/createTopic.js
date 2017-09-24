const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const TopicManager = require('../managers/TopicManager');
const VoteManager = require('../managers/VoteManager');

router.post('/', (req, res) => {
    console.log('Caught Cast Vote Request');

    promiseRetry((retry, attempt) => {
        console.log('Create Topic Attempt: ' + attempt);

        //TODO: Sanitize req inputs
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

            //res.status(200).json(resObj);
            //Create initial vote for new topic
            return VoteManager.castVote(topic.properties.topicId)
        })
        .then(($dbResult) => {
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

            res.status(200).json(resObj);
        })
        .catch(($error) => {
            if ($error.fields[0].code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                console.log('duplicate topic id, retrying: ' + attempt);
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