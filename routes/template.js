var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:template', function(req, res, next) {
  var template = req.params.template;
  res.render(template);
});

module.exports = router;
