var express = require('express');
var router = express.Router();
var shortid = require('shortid');

router.get('/:id', function(req, res, next) {
    var db = req.db;
    var targetId = req.params.id;

    //var to = req.body.to;
    //var max = (typeof req.body.max === 'undefined') ? 0 : req.body.max;
    db.collection('events').find({node_id: targetId}).toArray(function (err, items) {
        //var ret = [];
        //item.foreach
        res.json(items);
    });
});

router.post('/addEvent', function(req, res, next) {
    var params = req.body;
    var response = {'status':0, message:""};
    var db = req.db;
    var insert_data = {
        node_id: params.id,
        type: (typeof params.type === 'undefined') ? 0 : params.type, // default: 0
        date_create: new Date(),
        data: params.data[0]
    }
    db.collection('events').insert(insert_data, function(err, result) {
        if(err) {
            response.status = 1;
            response.msg = err;
        }
        res.send(response);
    });
});

router.get('/getGeoJson/:id', function(req, res, next) {
    var db = req.db;
    var targetId = req.params.id;
    var GeoJSON = require('geojson');
    //var to = req.body.to;
    //var max = (typeof req.body.max === 'undefined') ? 0 : req.body.max;
    db.collection('events').find({node_id: targetId}).toArray(function (err, items) {
        //var ret = [];
        //item.foreach
        //res.json(items);
        var geojson = GeoJSON.parse(items, {Point: ['data.gps.latitude', 'data.gps.longitude']})
        console.log(geojson);
        res.send(geojson);
    });
});

module.exports = router;
