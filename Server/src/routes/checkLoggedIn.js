/**
 * Created by Jake on 1/17/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.all('/', (req, res, next) => {
    req.ovdata = req.ovdata || {};

    if(typeof(req.user) == 'undefined' || !req.user.email.endsWith('@ansys.com')){
        console.log('Not logged in');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        req.logout();
        res.clearCookie('session');
        res.clearCookie('session.sig');
        res.status(401).json(resObj);
    } else {
        req.ovdata.sessionUser = User.newUserFromSessionUser(req.user);
        next();
    }

});

module.exports = router;