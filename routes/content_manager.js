require('https').globalAgent.options.rejectUnauthorized = false;
var express = require('express');
var router = express.Router();

router.get("/", function(req, res, next){
  res.render('content_editor', {title: 'Content Management'});
});

module.exports = router;
