const url = require('url');
const shortId = require('shortid');

let instance = null;

class ClientsManager {
    constructor($server){
        if(!instance) {
            instance = this;
            this.wss = $server;
            this.clientList = [];

            function originIsAllowed($origin) {
                //TODO: filter origins
                return true;
            }

            this.wss.on('connection', ($connection, $req) => {
                const location = url.parse($req.url, true);

                console.log((new Date()) + ' Connection accepted: ' + $req.connection.remoteAddress);
                $connection.connectionId = shortId.generate();
                this.clientList.push($connection);

                //Tell newly connected client what its id is
                let confirmMessage = {
                    msgType:'confirmed',
                    connectionId:$connection.connectionId
                };

                this.sendConnectionConfirmation($connection, confirmMessage);

                //Notify other clients a new client joined
                let joinMsg = {
                    msgType:'clientConnected',
                    connectionId:$connection.connectionId
                };
                this.sendMessage($connection, joinMsg);

                $connection.on('message', ($msg) => {
                    console.log('Raw Message: ', $msg);


                    //console.log('Message: ', $msg);
                });

                $connection.on('close', ($code, $reason) => {
                    console.log((new Date()) + ' Peer ' + $connection.address + ' disconnected.');
                    console.log('ReasonCode: ', $code);
                    console.log('Desc: ', $reason);

                    //Remove connection
                    console.log('Removing Connection from pool');
                    for(let i = 0; i < this.clientList.length; i++){
                        if(this.clientList[i] === $connection){
                            console.log('Removing Connection: ', i);
                            this.clientList.splice(i, 1);
                            break;
                        }
                    }

                    //Notify other clients
                    let dropMsg = {
                        msgType:'clientDropped',
                        connectionId: $connection.connectionId
                    };

                    this.sendMessage($connection, dropMsg);
                });

            });
        }

        return instance;
    }

    sendConnectionConfirmation($sourceConnection, $msgData){
        $sourceConnection.send(JSON.stringify($msgData));
    }

    sendMessage($sourceConnection, $dataObj){
        //Send message to other clients
        console.log('Sending: ', JSON.stringify($dataObj));

        for(let i = 0; i < this.clientList.length; i++){
            let conn = this.clientList[i];
            if($sourceConnection !== null && conn !== $sourceConnection) {
                conn.send(JSON.stringify($dataObj));
            }
        }
    }

    getConnectionById($id){
        for(let i = 0; i < this.clientList.length; i++){
            if(this.clientList[i].connectionId === $id){
                return this.clientList[i];
            }
        }

        return null;
    }

    notifyClientsOfVote($sourceClientId, $voteData){
        let sourceConnnection = this.getConnectionById($sourceClientId);
        let msgData = {
            msgType: 'voteUpdate',
            data: $voteData
        }

        this.sendMessage(sourceConnnection, msgData);
    }
}

module.exports = ClientsManager;