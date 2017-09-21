//Lib Imports
import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import JacEvent from 'jac/events/JacEvent';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import WSManager from 'WSManager';
import ReadyManager from 'ready/ReadyManager';

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
    //Basic Managers / Buses
    let geb = new GlobalEventBus();

    //Start App Here
    //UIManager

    let wsManager = new WSManager();
    wsManager.init();

})
.catch(($error) => {
    l.error('Ready ERROR: ', $error);
});