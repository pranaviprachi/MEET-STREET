//Authentication

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {

   if (req.oidc.isAuthenticated()) {

      res.render('home', {
         user: req.oidc.user
      });
   } else
      res.render('login');
});

module.exports = router;