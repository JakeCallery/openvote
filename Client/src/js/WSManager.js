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
        this.sendStringRequestDelegate = EventUtils.bind(self, self.handleSendStringRequest);
        this.sendImageRequestDelegate = EventUtils.bind(self, self.handleSendImageRequest);

        //Events
        this.geb.addEventListener('requestsendstring', self.sendStringRequestDelegate);
        this.geb.addEventListener('requestsendimage', self.sendImageRequestDelegate);
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
        });

        self.connection.addEventListener('close', ($evt) => {
            l.debug('Websocket connection closed: ', $evt);
        });

        self.connection.addEventListener('error', ($evt) => {
            l.debug('Websocket ERROR: ', $evt);
        });

        self.connection.addEventListener('message', ($evt) => {
            l.debug('Caught Message from Server: ', $evt.data);

            let msgObj = JSON.parse($evt.data);
            l.debug('Message: ', msgObj);

            switch(msgObj.msgType) {
                case 'confirmed':
                    l.debug('Setting Connection ID to: ' + msgObj.connectionId);
                    this.connectionId = msgObj.connectionId;
                    break;

                case 'clientConnected':
                    l.debug('Additional Client Connection: ', msgObj.connectionId);
                    break;

                case 'clientDropped':
                    l.debug('Client Dropped: ', msgObj.connectionId);
                    break;

                case 'voteUpdate':
                    l.debug('Remote Client Vote Update');
                    break;

                case 'topicUpdate':
                    l.debug('Remote Client Vote Update');
                    break;
            }
        });
    }
}

export default WSManager;