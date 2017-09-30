const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //App page
    let isLoggedIn = (typeof(req.user) !== 'undefined');

    if(!isLoggedIn || !req.user.email) {
        res.redirect('/login');
    } else if(!req.user.email.endsWith('@ansys.com')) {
        res.redirect('/notAuthorized');
    } else {
        res.render('dist/index', {
            title: 'OpenVote'
        });
    }
});

module.exports = router;
