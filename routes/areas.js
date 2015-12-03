var express = require('express');
var router = express.Router();
var shortid = require('shortid');

router.get('/getAreas', function(req, res, next) {
    var db = req.db;
    db.collection('areas').find().toArray(function (err, items) {
        res.json(items);
    });
});

router.post('/addArea', function(req, res, next) {
    console.log(req.body);
    var params = req.body.params;
    var response = {status:0, message:"OK", data: null};
    var db = req.db;
    var insert_data = {
        coords: params.coords,
        cuids : params.cuids,
        name  : params.name,
        area_id : shortid.generate()
    }
    db.collection('areas').insert(insert_data, function(err, result){

        if(err) {
            response.status = 1;
            response.message = err;
        }
        else {
            response.data = result[0];
        }
        //console.dir(result);
        res.send(response);
    });
});

router.delete('/deleteArea/:id', function(req, res, next) {
    var db = req.db;
    var targetId = req.params.id;
    console.log(targetId);
    db.collection('areas').removeById(targetId, function (err, result){
        if(err) {
          console.log(err);
        }
         res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

router.post('/updateArea/:id', function(req, res, next) {
  var db = req.db;
  var targetId = req.params.id;
  var updateField = req.body.updateField;
  db.collection('areas').updateById(targetId, updateField, function(err, result) {
    if(err) {
      console.log(err);
      res.send(err);
    }
    else {
      res.send("updated");
    }
  });
});

router.post('/updateContentCuids/:area_id', function(req, res, next) {
  var db = req.db;
  var target = req.params.area_id;
  var new_cuids = req.body.cuids;
  db.collection('areas').update({area_id: target}, {$set: {cuids: new_cuids}}, function(err, result) {
    if(err) {
      console.log(err);
      res.send(err);
    }
    else {
      res.send("updated");
    }
  });
});

module.exports = router;
