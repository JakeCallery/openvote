const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //App page

    let isLoggedIn = (typeof(req.user) !== 'undefined');
    console.log('Logged In: ', isLoggedIn);

    res.render('dist/apiTest', {
        title: 'ApiTestPage',
        isLoggedIn: isLoggedIn
    });
});

module.exports = router;