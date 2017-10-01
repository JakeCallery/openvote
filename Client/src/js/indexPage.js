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

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

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

        let topics = $evt.data.topics;

        //Sort data
        topics.sort(($a, $b) => {
            if(parseInt($a.voteCount) < parseInt($b.voteCount)){
                return 1;
            } else if(parseInt($a.voteCount) > parseInt($b.voteCount)){
                return -1;
            } else {
                return 0;
            }
        });
        uiManager.createGraph(topics);
    });

    uigeb.addEventListener('requestSubmitTopic', ($evt) => {
        l.debug('Caught Request submit topic: ', $evt.data);
        requestManager.createTopic({topicName: $evt.data})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS){
                l.debug('Good Topic Submit', $response);

                //update ui
                geb.dispatchEvent(new JacEvent('newTopicCreated', $response.data));

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
        l.debug('Caught request to cast vote', $evt.data);
        requestManager.castVote({topicId: $evt.data})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS){
                l.debug('Good vote cast', $response);
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

    //Kick off
    geb.dispatchEvent(new JacEvent('requestnewtopicdata'));

})
.catch(($error) => {
    l.error('Ready ERROR: ', $error);
});