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

        this.pingIntervalId = null;

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

            if(this.pingIntervalId !== null){
                clearInterval(this.pingIntervalId);
            }

            //Start ping
            this.pingIntervalId = setInterval(() => {
                l.debug('Sending Ping');
                this.sendPing();
            }, 2000);

            this.geb.dispatchEvent(new JacEvent('wsOpened', $evt));
        });

        self.connection.addEventListener('close', ($evt) => {
            l.debug('Websocket connection closed: ', $evt);

            let reason = null;
            // See http://tools.ietf.org/html/rfc6455#section-7.4.1
            if ($evt.code === 1000)
                reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            else if($evt.code === 1001)
                reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            else if($evt.code === 1002)
                reason = "An endpoint is terminating the connection due to a protocol error";
            else if($evt.code === 1003)
                reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            else if($evt.code === 1004)
                reason = "Reserved. The specific meaning might be defined in the future.";
            else if($evt.code === 1005)
                reason = "No status code was actually present.";
            else if($evt.code === 1006)
                reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            else if($evt.code === 1007)
                reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
            else if($evt.code === 1008)
                reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            else if($evt.code === 1009)
                reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            else if($evt.code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            else if($evt.code === 1011)
                reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            else if($evt.code === 1015)
                reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
            else
                reason = "Unknown reason";

            l.debug('Code: ' + $evt.code);
            l.debug('Reason: ' + reason);

            this.geb.dispatchEvent(new JacEvent('wsClosed', {code:$evt.code, reason:reason}));
            this.geb.dispatchEvent(new JacEvent('wsDisconnected', {code:$evt.code, reason:reason}));
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

    sendPing(){
        l.debug('Connection Ready State: ', this.connection.readyState);
        l.debug('Constant: ', this.connection.CONNECTING);
        if(
            this.connection.readyState === this.connection.CLOSING ||
            this.connection.readyState === this.connection.CLOSED
        ) {
            //Attempt reconnect
            l.debug('Attempting Reconnect');
            this.init();
        }

        if(this.connection.readyState === this.connection.OPEN){
            l.debug('Connection was last Open, sending ping...');
            try {
                this.connection.send('ping');
            } catch ($error) {
                l.error('Ping Send Error: ', $error);
            }

        }

    }
}

export default WSManager;