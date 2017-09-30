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
    }

    init(){
        l.debug('UI Manager Init');
        let self = this;

        //DOM Elements
        this.graphContainerDiv = this.doc.getElementById('graphContainerDiv');
        this.graphUl = this.doc.getElementById('graphUl');

        //Delegates
        this.createVoteClickDelegate = EventUtils.bind(self, self.handleCreateVoteClick);
        this.requestCreateVoteDelegate = EventUtils.bind(self, self.handleRequestCreateVote);

        //Events
        this.uigeb.addEventListener('requestCreateVote', self.requestCreateVoteDelegate);
    }

    createGraph($topicList){
        l.debug('Create Graph UI Topic Data: ', $topicList);

        this.clearGraphContainer();

        for(let i = 0; i < $topicList.length; i++){
            let li = this.createTopicRow($topicList[i]);
            this.graphUl.appendChild(li);
        }
    }

    createTopicRow($topic){
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
        let progressBarSpan = this.doc.createElement('span');
        DOMUtils.addClass(progressBarSpan, 'progressBarSpan');
        progressBarSpan.innerHTML = '200';

        progressBarFill.appendChild(progressBarSpan);
        progressBarTrack.appendChild(progressBarFill);
        progressBarDiv.appendChild(progressBarTrack);

        //Final Assembly
        li.appendChild(topicTitleP);
        li.appendChild(progressBarDiv);

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

/*
    handleCreateVoteClick($evt){
        l.debug('Create Vote Click');
        $evt.target.disabled = true;
        this.uigeb.dispatchUIEvent('requestCreateVote',
            'test',
            () => {
                $evt.target.disabled = false;
            })
    }

    handleRequestCreateVote($evt){
        l.debug('Request Create Vote');

        //do fetch
        this.requestManager.castVote({})
        .then(($response) => {
            l.debug('Response: ', $response);
            if($response.status === Status.SUCCESS) {
                this.uigeb.completeUIEvent($evt.id, $response);
            }
        })
        .catch(($error) => {
            this.uigeb.completeUIEvent($evt.id, $error);
        });

    }
*/

}

export default UIManager;