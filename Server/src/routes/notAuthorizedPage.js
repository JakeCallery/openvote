const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.clearCookie('session');
    res.clearCookie('session.sig');
    res.render('dist/notAuthorized', {
        title: 'Not Authorized'
    });
});

module.exports = router;