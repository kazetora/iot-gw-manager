require('https').globalAgent.options.rejectUnauthorized = false;
var express = require('express');
var router = express.Router();
var config = require('config');

router.get('/getContents/:ctype/:cuid?', function(req, res, next) {
    // var db = req.db;
    // db.collection('nodes').find().toArray(function (err, items) {
    //     res.json(items);
    // });
    var ctype = (typeof req.params.ctype !== 'undefined') ? req.params.ctype : "";
    var cuid = (typeof req.params.cuid !== 'undefined') ? req.params.cuid : "";

    var Client = require('node-rest-client').Client;
    client = new Client();
    var wfms = config.get('wfms');
    var get_content_url = "https://" + wfms.server + wfms.content_req_uri;// + "/" + wfms.content_type[ctype];
    if(ctype && (ctype in wfms.content_type)) {
        get_content_url += "/" + wfms.content_type[ctype];
    }
    if(cuid ) {
        get_content_url += "/" + cuid;
    }
    console.log(get_content_url);
    var req = client.get(get_content_url, function(data, response){
      if(!Array.isArray(data)) {
        data = [data];
      }
      console.log(data);

      res.send(data);
    });

    req.on("error", function(err){
      console.log('request error', err);
      res.send(error);
    })
});

router.get('/getDeliveries/:cid?', function(req, res, next) {
    // var db = req.db;
    // db.collection('nodes').find().toArray(function (err, items) {
    //     res.json(items);
    // });
    var cid = req.params.cid;
    var Client = require('node-rest-client').Client;
    client = new Client();
    var wfms = config.get('wfms');
    var get_content_url = "https://" + wfms.server + wfms.delivery_req_uri;// + "/" + wfms.content_type.news;
    if(cid) {
        get_content_url += "/" + cid;
    }
    console.log(get_content_url);
    client.get(get_content_url, function(data, response){
      console.log(data.toString());
      res.send(data);
    })

    req.on("error", function(err){
      console.log('request error', err);
      res.send(error);
    })
});
module.exports = router;
