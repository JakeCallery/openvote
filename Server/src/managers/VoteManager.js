const shortId = require('shortid');
const db = require('../config/db');

class VoteManager {
    constructor(){

    }

    static castVote($topicId){
        let session = db.session();
        let voteId = shortId.generate();

        return session
        .run(
            'MATCH (topic:Topic {topicId:{topicId}}) ' +
            'CREATE (vote:Vote {voteId:{voteId}}), ' +
            '(topic)-[:HAS_VOTE]->(vote) ' +
            'WITH topic, vote ' +
            'MATCH (topic)-[:HAS_VOTE]->(v:Vote) ' +
            'WITH topic, vote, count(v) as voteCount ' +
            'RETURN vote, topic, voteCount',
            {
                voteId: voteId,
                topicId: $topicId
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
                    reject('Expected 1 vote record created, but received: ' + numRecords);
                });
            }
        })
        .catch(($error) => {
            session.close();
            return new Promise((resolve, reject) => {
                console.error('Cast Vote Error: ' + $error);
                reject($error);
            });
        });
    }
}

module.exports = VoteManager;