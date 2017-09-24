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
        self.createVoteButton = this.doc.getElementById('createVoteButton');

        //Delegates
        self.createVoteClickDelegate = EventUtils.bind(self, self.handleCreateVoteClick);
        self.requestCreateVoteDelegate = EventUtils.bind(self, self.handleRequestCreateVote);

        //Events
        self.createVoteButton.addEventListener('click', self.createVoteClickDelegate);
        this.uigeb.addEventListener('requestCreateVote', self.requestCreateVoteDelegate)


    }

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
}

export default UIManager;