const http = require('http');
const path = require('path');
const url = require('url');
const express = require('express');
const WebSocket = require('ws');
const db = require('./config/db');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');
const ejs = require('ejs');

//Basic Pages
const indexPage = require('./routes/indexPage');

let connections = [];

const server = http.createServer(app);

const wss = new WebSocket.Server({
    server:server
});


function originIsAllowed($origin) {
    //TODO: filter origins
    return true;
}

wss.on('connection', ($connection, $req) => {
    const location = url.parse($req.url, true);

    console.log((new Date()) + ' Connection accepted: ' + $req.connection.remoteAddress);
    connections.push($connection);

    $connection.on('message', ($msg) => {
        let msgType = typeof $msg;
        console.log('Sending message of Type: ', msgType);

        //Send message to other clients
        for(let i = 0; i < connections.length; i++){
            let conn = connections[i];
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
        for(let i = 0; i < connections.length; i++){
            if(connections[i] === $connection){
                console.log('Removing Connection: ', i);
                connections.splice(i, 1);
            }
        }
    });

});

server.listen(8888, () => {
    console.log('Listening on %d', server.address().port);
});

//Server Setup
app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('trust proxy', 1);
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Page routes
app.use('/', indexPage);

//API routes

//Static Serving
app.use(express.static(path.join(__dirname, 'views/dist')));
