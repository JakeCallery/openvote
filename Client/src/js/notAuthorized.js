//Lib Imports
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import ReadyManager from 'ready/ReadyManager';
import DOMUtils from 'jac/utils/DOMUtils';
import BrowserUtils from 'jac/utils/BrowserUtils';

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL);
l.levelFilter = (LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

let urlParams = BrowserUtils.getURLParams(window);

if(urlParams.hasOwnProperty('debug') && urlParams.debug === 'true'){
    l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);
}

let readyManager = new ReadyManager();
readyManager.ready()
    .then(($response) => {
        l.debug('READY!');
        document.body.style.opacity='1';
        DOMUtils.addClass(document.body, 'bodyFadeIn');
})
.catch(($error) => {
    l.error('Ready ERROR: ', $error);
});