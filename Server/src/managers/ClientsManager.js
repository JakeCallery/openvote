const url = require('url');

class ClientsManager {
    constructor($server){
        this.wss = $server;
        this.clientList = [];

        function originIsAllowed($origin) {
            //TODO: filter origins
            return true;
        }

        this.wss.on('connection', ($connection, $req) => {
            const location = url.parse($req.url, true);

            console.log((new Date()) + ' Connection accepted: ' + $req.connection.remoteAddress);
            this.clientList.push($connection);

            $connection.on('message', ($msg) => {
                let msgType = typeof $msg;
                console.log('Sending message of Type: ', msgType);

                //Send message to other clients
                for(let i = 0; i < this.clientList.length; i++){
                    let conn = this.clientList[i];
                    if(conn !== $connection) {
                        conn.send($msg);
                    }
                }
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
                    }
                }
            });

        });

    }
}

module.exports = ClientsManager;