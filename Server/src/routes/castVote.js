const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');
const VoteManager = require('../managers/VoteManager');

router.post('/', (req, res) => {
    console.log('Caught Cast Vote Request');

    promiseRetry((retry, attempt) => {
        console.log('Cast Vote Attempt: ' + attempt);
        return VoteManager.castVote()
        .then(($dbResult) => {
            console.log('Cast Vote DBResult: ' + $dbResult);

            let vote = $dbResult.records[0].get('vote');

            let resObj = {
                status:'SUCCESS'
            };

            resObj.data = {
                voteId: vote.voteId
            };

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