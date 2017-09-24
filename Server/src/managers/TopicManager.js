const shortId = require('shortid');
const db = require('../config/db');

class TopicManager {
    constructor() {

    }

    static createTopic($topicName) {
        let session = db.session();
        let topicId = shortId.generate();

        return session
        .run(
            'CREATE (' +
            'topic:Topic {' +
            'topicId:{topicId},' +
            'topicName:{topicName}' +
            '}) ' +
            'RETURN topic',
            {
                topicId: topicId,
                topicName: $topicName
            }
        )
        .then(($dbResult) => {
            session.close();
            let numRecords = $dbResult.records.length;
            if(numRecords === 1){
                console.log('Num Records (should be 1): ', numRecords);
                return new Promise((resolve, reject) => {
                    resolve($dbResult);
                });
            } else {
                return new Promise((resolve, reject) => {
                    reject('Expected 1 topic record created, but received: ' + numRecords);
                });
            }
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                console.error('Create Topic Error');
                reject($error);
            });
        });
    }

}

module.exports = TopicManager;