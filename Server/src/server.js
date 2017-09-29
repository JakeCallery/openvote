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
const session = require('cookie-session');
const passport = require('passport');
const passportConfig = require('./config/passport')(passport);

//TODO: externalize keys
app.use(session({
    name: 'session',
    keys: ['6bXufH9qXWmZhQznx33QY26QV','5BBqd75pQ3mMwKohtSjf8Thqp'],
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Set up passport
app.use(passport.initialize());
app.use(passport.session());

//Login/out
const login = require('./routes/login');
const logout = require('./routes/logout');

//Google Auth
const authGoogle = require('./routes/authGoogle');
const authGoogleCallback = require('./routes/authGoogleCallback');

//Basic Pages
const indexPage = require('./routes/indexPage');
const apiTestPage = require('./routes/apiTestPage');

//Api
const castVote = require('./routes/castVote');
const createTopic = require('./routes/createTopic');
const getTopics = require('./routes/getTopics');
const checkLoggedIn = require('./routes/checkLoggedIn');

//Setup server
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

//Auth Routes
app.use('/auth/google', authGoogle);
app.use('/auth/google/callback', authGoogleCallback);
app.use('/login', login);
app.use('/logout', logout);

//API routes
app.use('/api/*', checkLoggedIn);
app.use('/api/castVote', castVote);
app.use('/api/createTopic', createTopic);
app.use('/api/getTopics', getTopics);

//Static Serving
app.use(express.static(path.join(__dirname, 'views/dist')));
