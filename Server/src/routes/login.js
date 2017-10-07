/**
 * Created by Jake on 1/4/2017.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let isLoggedIn = (typeof(req.user) !== 'undefined');

    if(isLoggedIn) {
        //Just redirect to root
        res.redirect('/');
    } else {
        res.clearCookie('session');
        res.clearCookie('session.sig');
        res.render('dist/login', {
            title: 'OpenVote Login'
        });
    }



});

module.exports = router;
