const ClientsManager = require('./managers/ClientsManager');

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
const apiTestPage = require('./routes/apiTestPage');

//Api
const castVote = require('./routes/castVote');

const server = http.createServer(app);

const wss = new WebSocket.Server({
    server:server
});

let clientsManager = new ClientsManager(wss);

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
app.use('/apiTestPage', apiTestPage);

//API routes
app.use('/api/castVote', castVote);

//Static Serving
app.use(express.static(path.join(__dirname, 'views/dist')));
