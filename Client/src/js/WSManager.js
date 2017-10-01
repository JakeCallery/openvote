import l from 'jac/logger/Logger';
import DOMUtils from 'jac/utils/DOMUtils';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import BlobUtils from 'jac/utils/BlobUtils';

class WSManager extends EventDispatcher {
    constructor($doc) {
        super();
        let self = this;

        this.geb = new GlobalEventBus();
        this.doc = $doc;
        this.connect = undefined;
        this.connectionId = null;

        //Delegates

        //Events

    }

    init() {
        l.debug('WS Manager Init');
        let self = this;

        let host = window.document.location.host.replace(/:.*/, '');
        let websocketURL = 'ws://' + host + ':' + window.document.location.port;
        l.debug('Websocket URL: ' + websocketURL);
        self.connection = new WebSocket(websocketURL);

        self.connection.addEventListener('open', ($evt) => {
            l.debug('Websocket Connected, waiting on id from server: ', $evt);
            this.geb.dispatchEvent(new JacEvent('wsOpened', $evt));
        });

        self.connection.addEventListener('close', ($evt) => {
            l.debug('Websocket connection closed: ', $evt);
            this.geb.dispatchEvent(new JacEvent('wsClosed', $evt));
            this.geb.dispatchEvent(new JacEvent('wsDisconnected', $evt));
        });

        self.connection.addEventListener('error', ($evt) => {
            l.debug('Websocket ERROR: ', $evt);
            this.geb.dispatchEvent(new JacEvent('wsError', $evt));
        });

        self.connection.addEventListener('message', ($evt) => {
            l.debug('Caught Message from Server: ', $evt.data);

            let msgObj = JSON.parse($evt.data);
            l.debug('Message: ', msgObj);

            switch(msgObj.msgType) {
                case 'confirmed':
                    l.debug('Setting Connection ID to: ' + msgObj.connectionId);
                    this.connectionId = msgObj.connectionId;
                    this.geb.dispatchEvent(new JacEvent('wsConnected', this.connectionId));
                    break;

                case 'clientConnected':
                    l.debug('Additional Client Connection: ', msgObj.connectionId);
                    this.geb.dispatchEvent(new JacEvent('remoteClientConnected', msgObj.connectionId));
                    break;

                case 'clientDropped':
                    l.debug('Client Dropped: ', msgObj.connectionId);
                    this.geb.dispatchEvent(new JacEvent('remoteClientDropped', msgObj.connectionId));
                    break;

                case 'voteUpdate':
                    l.debug('Remote Client Vote Update: ', msgObj.data);
                    this.geb.dispatchEvent(new JacEvent('newRemoteVoteData', msgObj.data));
                    break;

                case 'topicUpdate':
                    l.debug('Remote Client Topic Update');
                    this.geb.dispatchEvent(new JacEvent('newRemoteTopicData', msgObj.data));
                    break;
            }
        });
    }
}

export default WSManager;