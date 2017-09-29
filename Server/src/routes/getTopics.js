const express = require('express');
const router = express.Router();
const TopicManager = require('../managers/TopicManager');
const neo4j = require('neo4j-driver').v1;
const User = require('../models/User');

router.get('/', (req, res) => {
    console.log('Caught Get Topics');

    let user = req.ovdata.sessionUser;

    console.log('User from Session: ', user);

    TopicManager.getTopics()
    .then(($dbResult) => {
        console.log('Get Topics Result: ', $dbResult);

        let resObj = {
            status:'SUCCESS',
            data: {
                topics:[]
            }
        };

        for(let i = 0; i < $dbResult.records.length; i++){
            let topic = $dbResult.records[i].get('topic');
            let count = $dbResult.records[i].get('voteCount');
            count = neo4j.int(count);

            if(neo4j.integer.inSafeRange(count)){
                count = count.toNumber();
            } else {
                console.error('INT overrun / vote count too big for topic: ' + topic.properties.topicId + ' / ' + topic.properties.topicName);
                //TODO: Gracefully handle this issue on the client
                resObj.status = 'ERROR';
                resObj.error = 'Vote count for topic too high (int too big for JS)';
                res.status(500).json(resObj);
                return;
            }

            resObj.data.topics.push(
                {
                    topicName: topic.properties.topicName,
                    topicId: topic.properties.topicId,
                    voteCount: count
                }
            )
        }

        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('Get Topics Error: ', $error);
        let resObj = {
            status:'ERROR'
        };
        if($error.hasOwnProperty('error')){
            //we generated the error
            resObj.error = $error.error;
        } else {
            resObj.error = $error
        }
        res.status(400).json(resObj)
    })

});

module.exports = router;