const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //App page
    res.render('dist/login', {
        title: 'Login'
    });
});

module.exports = router;