var express = require('express');
var router = express.Router();
var shortid = require('shortid');

router.get('/:id', function(req, res, next) {
    var db = req.db;
    var targetId = req.params.id;

    var startdate = new Date(req.query.startdate);
    var enddate = new Date(req.query.enddate);

    var filter = {
      node_id: targetId,
      date_create: {
        $gte: startdate,
        $lte: enddate
      },
      lat: {$ne: 0},
      lon: {$ne: 0}
    }
    console.dir(filter);
    //var to = req.body.to;
    //var max = (typeof req.body.max === 'undefined') ? 0 : req.body.max;
    db.collection('events').find(filter).toArray(function (err, items) {
        //var ret = [];
        //item.foreach
        res.json(items);
    });
});

router.post('/addEvent', function(req, res, next) {
    var params = req.body;
    var response = {'status':0, message:""};
    var db = req.db;
    // check data validity
    if(params.data[0].accel.X !== null && params.data[0].accel.Y !== null && params.data[0].accel.Z !== null) {
      var insert_data = {
          node_id: params.id,
          type: (typeof params.type === 'undefined') ? 0 : params.type, // default: 0
          date_create: new Date(),
          accel: params.data[0].accel,
          lat: params.data[0].gps.latitude,
          lon: params.data[0].gps.longitude
      }
      db.collection('events').insert(insert_data, function(err, result) {
          if(err) {
              response.status = 1;
              response.msg = err;
          }
          res.send(response);
      });
    }
    else {
      res.send(response);
    }
});

router.post('/getGeoJson/', function(req, res, next) {
    var db = req.db;
    console.dir(req.body)
    var targetIds = req.body.node_ids;
    var GeoJSON = require('geojson');
    var center = require('turf-center');
    var startdate = new Date(req.body.startdate);
    var enddate = new Date(req.body.enddate);

    var filter = {
      node_id: { $in: targetIds},
      date_create: {
        $gte: startdate,
        $lte: enddate
      },
      lat: {$ne: 0},
      lon: {$ne: 0}
    }
    console.dir(filter);
    //var to = req.body.to;
    //var max = (typeof req.body.max === 'undefined') ? 0 : req.body.max;
    db.collection('events').find(filter).toArray(function (err, items) {
        //var ret = [];
        //item.foreach
        //res.json(items);
        var geojson = GeoJSON.parse(items, {Point: ['lat', 'lon']})
        centerPt = center(geojson);
        console.dir(centerPt.geometry.coordinates);
        var ret = {
          center: {
            lng: centerPt.geometry.coordinates[0],
            lat: centerPt.geometry.coordinates[1]
          },
          data: geojson
        }
        //console.log(geojson);
        res.send(ret);
    });
});

module.exports = router;
