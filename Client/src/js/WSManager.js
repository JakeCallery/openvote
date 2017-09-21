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

        this.geb = new GlobalEventBus();
        this.doc = $doc;
        this.connect = undefined;
        let self = this;

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

        self.connection.onopen = () => {
            //this.connection.send('Ping');
            l.debug('Websocket Connected');
        };

        self.connection.onerror = ($err) => {
            l.error('WebSocket error: ', $err);
        };

        self.connection.onmessage = ($evt) => {
            l.debug('Caught Message from Server');
            let obj = JSON.parse($evt.data);

            if(obj.type) {
                if(obj.type === 'text') {
                    l.debug('Message: ', obj.data);
                } else if (obj.type === 'img') {
                    l.debug('Image: ');
                    this.geb.dispatchEvent(new JacEvent('newimagebase64data', obj.data));
                } else {
                    l.error('Bad Type: ', obj.type);
                }
            } else {
                l.error('Bad data, missing "type" property');
            }
        };

    }

    handleSendImageRequest($evt) {
        let self = this;

        l.debug('Sending Image');
        let imgDataObj = {
            'type': 'img',
            'data': $evt.data
        };

        self.connection.send(JSON.stringify(imgDataObj));
    }

    handleSendStringRequest($evt) {
        let self = this;

        l.debug('Sending String', $evt.data);
        let textDataObj = {
            'type': 'text',
            'data': $evt.data
        };
        self.connection.send(JSON.stringify(textDataObj));
    }
}

export default WSManager;