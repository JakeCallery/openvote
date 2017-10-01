import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import UIGEB from 'general/UIGEB';
import RequestManager from 'RequestManager';
import Status from 'general/Status';

class UIManager extends EventDispatcher {
    constructor($doc){
        super();

        this.geb = new GlobalEventBus();
        this.uigeb = new UIGEB();
        this.doc = $doc;
        this.requestManager = new RequestManager();

        this.currentMaxCount = 0;
    }

    init(){
        l.debug('UI Manager Init');
        let self = this;

        //DOM Elements
        this.graphContainerDiv = this.doc.getElementById('graphContainerDiv');
        this.graphUl = this.doc.getElementById('graphUl');
        this.submitTopicField = this.doc.getElementById('submitTopicField');
        this.submitTopicButton = this.doc.getElementById('submitTopicButton');

        //Delegates
        this.submitTopicButtonClickDelegate = EventUtils.bind(self, self.handleSubmitTopicClick);
        this.newTopicCreatedDelegate = EventUtils.bind(self, self.handleNewTopicCreated);

        //Events
        this.submitTopicButton.addEventListener('click', this.submitTopicButtonClickDelegate);
        this.geb.addEventListener('newTopicCreated', this.newTopicCreatedDelegate);
    }

    handleNewTopicCreated($evt){
        let topic = $evt.data;
        let topicRow = this.createTopicRow(topic, this.currentMaxCount);
        this.graphUl.appendChild(topicRow);
    }

    handleSubmitTopicClick($evt) {
        l.debug('Caught Submit Button Click');
        $evt.target.disabled = true;
        this.uigeb.dispatchUIEvent('requestSubmitTopic', this.submitTopicField.value, () => {
             $evt.target.disabled = false;
        });
    }

    createGraph($topicList){
        l.debug('Create Graph UI Topic Data: ', $topicList);

        this.clearGraphContainer();
        this.currentMaxCount = $topicList[0].voteCount;

        for(let i = 0; i < $topicList.length; i++){
            let li = this.createTopicRow($topicList[i], this.currentMaxCount);
            this.graphUl.appendChild(li);
        }
    }

    createTopicRow($topic, $maxCount){

        //Calc bar percentage
        let countPercent = Math.round(($topic.voteCount / $maxCount) * 100);

        //Artificially bump to 1
        if(countPercent === 0){
            countPercent = 1
        }

        l.debug('Count Percent: ', countPercent, $topic.voteCount, $maxCount);

        let li = this.doc.createElement('li');
        DOMUtils.addClass(li, 'graphLi');

        let topicTitleP = this.doc.createElement('p');
        DOMUtils.addClass(topicTitleP, 'topicTitleP');
        topicTitleP.innerHTML = $topic.topicName;

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
        DOMUtils.addClass(voteButton, 'simpleButton');
        DOMUtils.addClass(voteButton, 'voteButton');
        voteButton.innerHTML = 'Vote';
        voteButton.handleClick = ($evt) => {
            l.debug('vote Click: ', $topic.topicId);
            $evt.target.disabled = true;
            this.uigeb.dispatchUIEvent('requestCastVote', $topic.topicId, () => {
                $evt.target.disabled = false;
            });
        };
        voteButton.addEventListener('click', voteButton.handleClick);

        //Final Assembly
        voteButtonDiv.appendChild(voteButton);
        progressBarFill.appendChild(progressBarSpan);
        progressBarTrack.appendChild(progressBarFill);
        progressBarDiv.appendChild(progressBarTrack);
        li.appendChild(topicTitleP);
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