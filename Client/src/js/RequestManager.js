import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import Status from 'general/Status';

export default class RequestManager extends EventDispatcher {
    constructor() {
        super();
        let self = this;
        l.debug('New Request Manager');
        this.geb = new GlobalEventBus();
    }

    getTopics() {
        return new Promise((resolve, reject) => {
            fetch('/api/getTopics', {
                method: 'GET',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            .then(($response) => {
                return $response.json()
            })
            .then(($res) => {
                l.debug('Response: ', $res);
                resolve({
                    status:$res.status,
                    data:$res.data
                });
            })
            .catch(($error) => {
                l.debug('Get Topics Error: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            })
        });
    }

    castVote($voteData) {
        return new Promise((resolve, reject) => {
           fetch('/api/castVote', {
               method: 'POST',
               credentials: 'include',
               headers: new Headers({
                   'Content-Type': 'application/json'
               }),
               body: JSON.stringify($voteData)
           })
           .then(($response) => {
               return $response.json()
           })
           .then(($res) => {
               l.debug('Response: ', $res);
               resolve({
                   status:$res.status,
                   data: $res.data
               });
           })
           .catch(($error) => {
               l.debug('Cast Vote Error: ', $error);
               reject({
                   status: Status.ERROR,
                   data: $error
               });
           });
        });
    }

    createTopic($topicData) {
        return new Promise((resolve, reject) => {
            fetch('/api/createTopic', {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify($topicData)
            })
            .then(($response) => {
                return $response.json()
            })
            .then(($res) => {
                l.debug('JSON Response: ', $res);
                resolve({
                    status:$res.status,
                    data:$res.data
                });
            })
            .catch(($error) => {
                l.debug('Create Topic: ', $error);
                reject({
                    status: Status.ERROR,
                    data: $error
                });
            });
        });
    }
}