import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import UIGEB from 'general/UIGEB';
import RequestManager from 'RequestManager';
import Status from 'general/Status';
import TopicsDataModel from 'TopicsDataModel';
import StringUtils from 'jac/utils/StringUtils';

class UIManager extends EventDispatcher {
    constructor($doc){
        super();

        this.geb = new GlobalEventBus();
        this.uigeb = new UIGEB();
        this.doc = $doc;
        this.requestManager = new RequestManager();
        this.topicsDM = new TopicsDataModel();
    }

    init(){
        l.debug('UI Manager Init');
        let self = this;

        this.instructionsText = 'Enter New Topic Here';

        //DOM Elements
        this.graphContainerDiv = this.doc.getElementById('graphContainerDiv');
        this.graphUl = this.doc.getElementById('graphUl');
        this.submitTopicField = this.doc.getElementById('submitTopicField');
        this.submitTopicButton = this.doc.getElementById('submitTopicButton');
        this.logoutButton = this.doc.getElementById('logoutButton');

        //Delegates
        this.submitTopicButtonClickDelegate = EventUtils.bind(self, self.handleSubmitTopicClick);
        this.updatedTopicsDelegate = EventUtils.bind(self, self.handleUpdatedTopics);
        this.logoutButtonClickDelegate = EventUtils.bind(self, self.handleLogoutButtonClick);
        this.topicFieldFocusDelegate = EventUtils.bind(self, self.handleTopicFieldFocus);
        this.topicFieldBlurDelegate = EventUtils.bind(self, self.handleTopicFieldBlur);
        this.topicFieldKeyPressDelegate = EventUtils.bind(self, self.handleTopicFieldKeyPress);

        //Events
        this.submitTopicButton.addEventListener('click', this.submitTopicButtonClickDelegate);
        this.topicsDM.addEventListener('updatedTopics', this.updatedTopicsDelegate);
        this.logoutButton.addEventListener('click', this.logoutButtonClickDelegate);
        this.submitTopicField.addEventListener('focus', this.topicFieldFocusDelegate);
        this.submitTopicField.addEventListener('blur', this.topicFieldBlurDelegate);
        this.submitTopicField.addEventListener('keypress', this.topicFieldKeyPressDelegate);

        //Setup
        this.submitTopicField.value = this.instructionsText;
        this.submitTopicField.isEmpty = true;
    }

    handleTopicFieldKeyPress($evt){
        this.submitTopicField.isEmpty = false;
    }

    handleLogoutButtonClick($evt){
        window.location = '/logout';
    }

    handleTopicFieldFocus($evt) {
        if(this.submitTopicField.isEmpty === true){
            this.submitTopicField.value = '';
        }

        DOMUtils.removeClass(this.submitTopicField, 'submitTopicFieldInstructions');
    }

    handleTopicFieldBlur($evt) {
        let curValue = StringUtils.stripWhiteSpace(this.submitTopicField.value);

        if(curValue === ''){
            this.submitTopicField.isEmpty = true;
            DOMUtils.addClass(this.submitTopicField, 'submitTopicFieldInstructions');
            this.submitTopicField.value = this.instructionsText;
        }
    }

    handleUpdatedTopics($evt){
        for(let i = 0; i < $evt.data.length; i++){
            let topic = $evt.data[i];
            let topicUI = this.findTopicUI(topic.topicId);
            if(topicUI !== null){
                //Compare and update stats
                if(
                    topicUI.getVoteCountFromUI() !== topic.voteCount ||
                    topicUI.getCountPercentageFromUI() !== topic.countPercent)
                {
                    this.updateTopicRowUI(topic);
                }

            } else {
                //create new topic
                this.addTopicRowUI(topic);
            }
        }
    }

    findTopicUI($topicId){
        for(let i = 0; i < this.graphUl.childNodes.length; i++){
            let node = this.graphUl.childNodes[i];
            if(node.topicId === $topicId){
                return node;
            }
        }

        //None found
        return null;
    }

    updateTopicRowUI($topic){
        let topicUI = this.findTopicUI($topic.topicId);
        if(topicUI){
            topicUI.updateVoteCount($topic.voteCount, $topic.countPercent);
        } else {
            l.error('Bad No UI Matching Topic ID: ', $topic.topicId);
        }
    }

    addTopicRowUI($topic){
        let topicUI = this.createTopicRow($topic);
        this.graphUl.appendChild(topicUI);
    }

    handleSubmitTopicClick($evt) {
        l.debug('Caught Submit Button Click');

        if(this.submitTopicField.isEmpty === false && StringUtils.stripWhiteSpace(this.submitTopicField.value) !== ''){
            this.submitTopicField.value = '';
            this.submitTopicField.dispatchEvent(new Event('blur'));

            $evt.target.disabled = true;
            this.uigeb.dispatchUIEvent('requestSubmitTopic', this.submitTopicField.value, () => {
                $evt.target.disabled = false;
            });
        } else {
            l.error('Topic Field Is Empty');
        }
    }


    createTopicRow($topic){
        //Calc bar percentage
        let countPercent = $topic.countPercent;

        //Artificially bump to 1
        if(countPercent === 0){
            countPercent = 1
        }

        let li = this.doc.createElement('li');
        DOMUtils.addClass(li, 'graphLi');

        //Save custom props
        li.topicId = $topic.topicId;
        li.voteCount = $topic.voteCount;

        let topicTitleDiv = this.doc.createElement('div');
        DOMUtils.addClass(topicTitleDiv, 'topicTitleDiv');

        let topicTitleP = this.doc.createElement('p');
        DOMUtils.addClass(topicTitleP, 'topicTitleP');
        topicTitleP.innerHTML = $topic.topicName;
        topicTitleDiv.appendChild(topicTitleP);

        let progressBarDiv = this.doc.createElement('div');
        DOMUtils.addClass(progressBarDiv, 'progressBarDiv');

        let progressBarTrack = this.doc.createElement('div');
        DOMUtils.addClass(progressBarTrack, 'progressBarTrack');

        let progressBarFill = this.doc.createElement('div');
        DOMUtils.addClass(progressBarFill, 'progressBarFill');
        progressBarFill.style.width = countPercent.toString() + '%';

        let progressBarSpan = this.doc.createElement('span');
        DOMUtils.addClass(progressBarSpan, 'progressBarSpan');
        progressBarSpan.innerHTML = $topic.voteCount;

        let voteButtonDiv = this.doc.createElement('div');
        DOMUtils.addClass(voteButtonDiv, 'voteButtonDiv');

        let voteButton = this.doc.createElement('button');
        //DOMUtils.addClass(voteButton, 'simpleButton');
        DOMUtils.addClass(voteButton, 'voteButton');
        voteButton.innerHTML = 'Vote';
        voteButtonDiv.handleClick = ($evt) => {
            l.debug('vote Click: ', $topic.topicId);
            $evt.target.disabled = true;
            this.uigeb.dispatchUIEvent('requestCastVote', $topic.topicId, () => {
                $evt.target.disabled = false;
            });
        };
        voteButtonDiv.addEventListener('click', voteButtonDiv.handleClick);

        //Custom functions
        li.updateVoteCount = ($newCount, $countPercent) => {
            li.voteCount = $newCount;
            let stylePercent = $countPercent.toString() + '%';
            progressBarSpan.innerHTML = $newCount;
            progressBarFill.style.width = stylePercent;
        };

        li.getVoteCountFromUI = () => {
            return parseInt(progressBarSpan.innerHTML);
        };

        li.getCountPercentageFromUI = () => {
            let percentString = progressBarFill.style.width;
            return parseInt(percentString.substring(0, percentString.length - 1));
        };
        //Final Assembly
        voteButtonDiv.appendChild(voteButton);
        progressBarFill.appendChild(progressBarSpan);
        progressBarTrack.appendChild(progressBarFill);
        progressBarDiv.appendChild(progressBarTrack);
        //li.appendChild(topicTitleP);
        li.appendChild(topicTitleDiv);
        li.appendChild(progressBarDiv);
        li.appendChild(voteButtonDiv);

        return li;
    }

    clearGraphContainer(){
        //TODO: Proper JS clean up
        l.debug('Clear graph UL');
        let numChildNodes = this.graphUl.childNodes.length;
        for(let i = numChildNodes-1; i >= 0; i--){
            let node = this.graphUl.childNodes[i];
            this.graphUl.removeChild(node);
        }
    }
}

export default UIManager;