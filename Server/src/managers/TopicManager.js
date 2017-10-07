const shortId = require('shortid');
const db = require('../config/db');

class TopicManager {
    constructor() {

    }

    static getTopics() {
        let session = db.session();

        return session
        .run(
            'MATCH (topic:Topic)-[:HAS_VOTE]->(vote:Vote) ' +
            'WITH topic,count(vote) as voteCount ' +
            'RETURN topic, voteCount'
        )
        .then(($dbResult) => {
            session.close();
            return new Promise((resolve, reject) => {
                resolve($dbResult);
            });
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                console.error('Get Topics Error: ', $error);
                reject($error);
            });
        });
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
                console.error('Create Topic Error', $error);
                reject($error);
            });
        });
    }

}

module.exports = TopicManager;