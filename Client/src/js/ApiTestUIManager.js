import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import UIGEB from 'general/UIGEB';
import RequestManager from 'RequestManager';
import Status from 'general/Status';

export default class ApiTestUIManager extends EventDispatcher {
    constructor($doc){
        super();

        this.geb = new GlobalEventBus();
        this.uigeb = new UIGEB();
        this.doc = $doc;
        this.requestManager = new RequestManager();
    }

    init(){
        l.debug('TestApi UI Manager Init');
        let self = this;

        //DOM Elements
        this.createTopicField = this.doc.getElementById('createTopicField');
        this.createTopicButton = this.doc.getElementById('createTopicButton');
        this.voteForTopicField = this.doc.getElementById('voteForTopicIdField');
        this.voteFortopicButton = this.doc.getElementById('voteForTopicButton');

        //Delegates
        this.createTopicButtonClickDelegate = EventUtils.bind(self, self.handleCreateTopicButtonClick);
        this.voteFortopicButtonClickDelegate = EventUtils.bind(self, self.handleVoteForTopicButtonClick);
        this.requestCreateTopicDelegate = EventUtils.bind(self, self.handleRequestCreateTopic);
        this.requestCastVoteDelegate = EventUtils.bind(self, self.handleRequestCastVote);

        //Events
        this.createTopicButton.addEventListener('click', self.createTopicButtonClickDelegate);
        this.voteFortopicButton.addEventListener('click', self.voteFortopicButtonClickDelegate);
        this.uigeb.addEventListener('requestCreateTopic', self.requestCreateTopicDelegate);
        this.uigeb.addEventListener('requestCastVote', self.requestCastVoteDelegate);
    }

    handleCreateTopicButtonClick($evt){
        l.debug('Create Topic Click');
        $evt.target.disabled = true;
        this.uigeb.dispatchUIEvent('requestCreateTopic',
            this.createTopicField.value,
            () => {
                $evt.target.disabled = false;
            }
        );
    }

    handleVoteForTopicButtonClick($evt){
        l.debug('Vote for topic click');
        $evt.target.disabled = true;
        this.uigeb.dispatchUIEvent('requestCastVote',
            this.voteForTopicField.value,
            () => {
                $evt.target.disabled = false;
            }
        );
    }

    handleRequestCastVote($evt){
        l.debug('Request Cast Vote');

        //do fetch
        let topicId = $evt.data;
        l.debug('Topic Id: ', topicId);

        this.requestManager.castVote({topicId:topicId})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS) {
                l.debug('Success');
                this.uigeb.completeUIEvent($evt.id, $response);
            } else {
                l.debug('Failed');
                this.uigeb.completeUIEvent($evt.id, $response);
            }
        })
        .catch(($error) => {
            this.uigeb.completeUIEvent($evt.id, $error);
        });
    }

    handleRequestCreateTopic($evt){
        l.debug('Request Create Topic');

        //do fetch
        let topicName = $evt.data;
        l.debug('Topic Name: ', topicName);

        this.requestManager.createTopic({topicName:topicName})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS) {
                l.debug('Success');
                this.uigeb.completeUIEvent($evt.id, $response);
            } else {
                l.debug('Failed');
                this.uigeb.completeUIEvent($evt.id, $response);
            }
        })
        .catch(($error) => {
            this.uigeb.completeUIEvent($evt.id, $error);
        });
    }
}