//Lib Imports
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import WSManager from 'WSManager';
import ReadyManager from 'ready/ReadyManager';
import UIManager from 'UIManager';
import DOMUtils from 'jac/utils/DOMUtils';

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let readyManager = new ReadyManager();
readyManager.ready()
    .then(($response) => {
        l.debug('READY!');
        document.body.style.opacity='1';
        DOMUtils.addClass(document.body, 'bodyFadeIn');

        let loginButton = document.getElementById('loginButton');
        loginButton.addEventListener('click', ($evt) => {
            l.debug('Login Clicked');
            window.location = '/auth/google';
        });

    })
    .catch(($error) => {
        l.error('Ready ERROR: ', $error);
    });