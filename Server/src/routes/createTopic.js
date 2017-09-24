const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const TopicManager = require('../managers/TopicManager');

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