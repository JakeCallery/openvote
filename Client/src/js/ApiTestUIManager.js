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
        self.createTopicField = this.doc.getElementById('createTopicField');
        self.createTopicButton = this.doc.getElementById('createTopicButton');
        self.voteForTopicField = this.doc.getElementById('voteForTopicIdField');
        self.voteFortopicButton = this.doc.getElementById('voteForTopicButton');

        //Delegates
        self.createTopicButtonClickDelegate = EventUtils.bind(self, self.handleCreateTopicButtonClick);
        self.voteFortopicButtonClickDelegate = EventUtils.bind(self, self.handleVoteForTopicButtonClick);

        //Events
        self.createTopicButton.addEventListener('click', self.createTopicButtonClickDelegate);
        self.voteFortopicButton.addEventListener('click', self.voteFortopicButtonClickDelegate);
    }

    handleCreateTopicButtonClick($evt){
        l.debug('Create Topic Click');
    }

    handleVoteForTopicButtonClick($evt){
        l.debug('Vote for topic click');
    }
}