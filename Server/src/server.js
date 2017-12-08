const ClientsManager = require('./managers/ClientsManager');
const fs = require('fs');
const https = require('https');
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
const expressSanitized = require('express-sanitize-escape');
const helmet = require('helmet');

//TODO: externalize keys
const cookieKeys = require('./keys/cookieKeys');
app.use(session({
    name: 'sessionId',
    keys: cookieKeys.keys,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    domain: 'jakecallery.com',
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
const notAuthorizedPage = require('./routes/notAuthorizedPage');

//Api
const castVote = require('./routes/castVote');
const createTopic = require('./routes/createTopic');
const getTopics = require('./routes/getTopics');
const checkLoggedIn = require('./routes/checkLoggedIn');

//Load web certs
let serverOptions = null;

if(process.env.development === 'true'){
    console.log('Using Development Cert');
    serverOptions = {
        key: fs.readFileSync('../Certs/dev/privkey.pem'),
        cert: fs.readFileSync('../Certs/dev/fullchain.pem'),
        ca: fs.readFileSync('../Certs/dev/chain.pem'),
    };
} else {
    serverOptions = {
        key: fs.readFileSync('../Certs/privkey.pem'),
        cert: fs.readFileSync('../Certs/fullchain.pem'),
        ca: fs.readFileSync('../Certs/chain.pem'),
    };
}

//Setup http server (for redirect to https)
// Redirect from http port 80 to https
http.createServer(function (req, res) {
    console.log('Redirect');
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(8080);

//Setup https server
const server = https.createServer(serverOptions, app);

//Setup socket server
const wss = new WebSocket.Server({
    server:server
});

let clientsManager = new ClientsManager(wss);

server.listen(8443, () => {
    console.log('Listening on %s:%d', server.address().address, server.address().port);
});

//Server Setup
app.use(helmet());
app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('trust proxy', 1);
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSanitized.middleware());

//Page routes
app.use('/', indexPage);
app.use('/apiTestPage', apiTestPage);
app.use('/notAuthorized', notAuthorizedPage);

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
