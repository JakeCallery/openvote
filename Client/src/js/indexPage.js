//Lib Imports
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import WSManager from 'WSManager';
import ReadyManager from 'ready/ReadyManager';
import UIManager from 'UIManager';
import RequestManager from "./RequestManager";
import Status from 'general/Status';
import UIGEB from 'general/UIGEB';
import TopicsDataModel from 'TopicsDataModel';

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let topicsDM = new TopicsDataModel();

let readyManager = new ReadyManager();
readyManager.ready()
    .then(($response) => {
    l.debug('READY!');

    //Set up event buses
    let geb = new GlobalEventBus();
    let uigeb = new UIGEB();

    //Start App Here
    let uiManager = new UIManager(document);
    uiManager.init();

    let wsManager = new WSManager();
    wsManager.init();

    let requestManager = new RequestManager();

    //Events
    geb.addEventListener('requestnewtopicdata', ($evt) => {
        requestManager.getTopics()
        .then(($response) => {
            if($response.status === Status.SUCCESS) {
                l.debug('Get Topics Success: ', $response);
                geb.dispatchEvent(new JacEvent('newtopicdata', $response.data));
            } else {
                l.debug('Get Topics Failed: ', $response);
            }
        })
        .catch(($error) => {
            l.debug('Get Topics Failed: ', $error);
        });
    });

    geb.addEventListener('newtopicdata', ($evt) => {
        l.debug('New Topic Data: ', $evt.data);
        topicsDM.updateTopics($evt.data.topics);
    });

    uigeb.addEventListener('requestSubmitTopic', ($evt) => {
        l.debug('Caught Request submit topic: ', $evt.data);
        requestManager.createTopic({topicName: $evt.data})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS){
                l.debug('Good Topic Submit', $response);
                let topic = $response.data;

                //Add Topic to local cache
                topicsDM.addTopic(topic);

            } else {
                l.debug('Topic Submit Failed', $response);
            }

            //Complete event cycle
            uigeb.completeUIEvent($evt.id, $response);
        })
        .catch(($error) => {
            l.debug('Cast Vote Error: ', $error);
            uigeb.completeUIEvent($evt.id, $error);
        });
    });

    uigeb.addEventListener('requestCastVote', ($evt) => {
        let topicId = $evt.data;
        l.debug('Caught request to cast vote', $evt.data);
        requestManager.castVote({topicId: topicId})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS){
                l.debug('Good vote cast', $response);
                topicsDM.setVoteCount($response.data.topicId, $response.data.voteCount);
            } else {
                l.debug('Cast Vote Failed', $response);
            }

            //Complete event cycle
            uigeb.completeUIEvent($evt.id, $response);
        })
        .catch(($error) => {
            l.debug('Cast Vote Error: ', $error);
            uigeb.completeUIEvent($evt.id, $response);
        });
    });

    geb.addEventListener('newRemoteVoteData', ($evt) => {
        let topicId = $evt.data.topicId;
        let voteCount = $evt.data.voteCount;
        topicsDM.setVoteCount(topicId, voteCount);
    });

    geb.addEventListener('newRemoteTopicData', ($evt) => {
        topicsDM.addTopic($evt.data);
    });

    //Kick off (load initial topics)
    geb.dispatchEvent(new JacEvent('requestnewtopicdata'));

})
.catch(($error) => {
    l.error('Ready ERROR: ', $error);
});