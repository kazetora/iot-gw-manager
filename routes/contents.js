require('https').globalAgent.options.rejectUnauthorized = false;
var express = require('express');
var router = express.Router();
var config = require('config');
var BeaconcastContent = require('../beaconcast/BeaconcastContent');

function getDeliveries(cid, onSuccess, onError) {
  var Client = require('node-rest-client').Client;
  client = new Client();
  var wfms = config.get('wfms');
  var get_content_url = "https://" + wfms.server + wfms.delivery_req_uri;// + "/" + wfms.content_type.news;
  if(cid) {
      get_content_url += "/" + cid;
  }
  get_content_url += "?sort=" + encodeURIComponent('{"created_time":-1}');
  console.log(get_content_url);
  var request = client.get(get_content_url, function(data, response){
    //console.log(data.toString());
    //res.send(data);
    onSuccess(data);
  })

  request.on("error", function(err){
    console.log('request error', err);
    //res.send(error);
    onError(error);
  })
}

router.get('/getEditContents/:ctype/:cuid?', function(req,res,next) {
  var wfms = config.get('wfms');
  var bccontent = new BeaconcastContent({
    api_server: "https://" + wfms.server
  });
  var params = {
    ctype: req.params.ctype
  };
  if (typeof req.params.cuid !== 'undefined') {
    params['cuid']= req.params.cuid;
  }
  if(JSON.stringify(req.query) !== '{}') {
    params['url_params']= req.query;
  }
  if(typeof req.query.keyword != 'undefined') {
    params['keyword']= req.query.keyword
  }
  bccontent.getContents(params, function(err, data){
    if(err){
      return res.send(err);
    }
    //console.log(data);
    res.send(data);
  });
});

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
    get_content_url += "?sort=" + encodeURIComponent('{"created_time":-1}');
    console.log(get_content_url);
    var request = client.get(get_content_url, function(data, response){
      if(!Array.isArray(data)) {
        data = [data];
      }
      //console.log(data);
      var final_data = [];
      getDeliveries("", function(deliveries) {
          var valid_cuids = [];
          var async = require("async");

          var process_data = function(cdata, ddata, onComplete) {
              async.each(cdata,
                 function(item, callback) {
                     if(ddata.indexOf(item.cuid) >=0 && item.status == "published") {
                         final_data.push(item);
                     }
                     callback();
                 },
                 function(err) {
                     onComplete();
                 }
              );
          }
          async.each(deliveries,
             function(item,callback) {
                 valid_cuids.push(item['cuid']);
                 callback();
             },
             function(err) {
                 process_data(data, valid_cuids, function() {
                   console.log(final_data.length);
                   res.send(final_data);
                 });
             }
          );

          //res.send(data);
      }, function(err) {
         res.send(err);
      });
    });

    request.on("error", function(err){
      console.log('request error', err);
      res.send(error);
    });
});

router.get('/getDeliveries/:cid?', function(req, res, next) {
    var cid = req.params.cid;
    getDeliveries(cid, function(data){
      res.send(data);
    }, function(err){
      res.send(error);
    });
});

router.delete('/deleteContent/:ctype/:cuid', function(req, res, next){
  var wfms = config.get('wfms');
  var bccontent = new BeaconcastContent({
    api_server: "https://" + wfms.server
  });
  bccontent.deleteContent(req.params.ctype, req.params.cuid, function(err){
    if(err)
      res.send(err);
    else
      res.send("OK");
  });
});

module.exports = router;
