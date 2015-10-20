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
    var response = {status:0, message:""};
    var db = req.db;
    var insert_data = {
        coords: params.coords,
        cuids : params.cuids,
        name  : params.name
    }
    db.collection('areas').insert(insert_data, function(err, result){

        if(err) {
            response.status = 1;
            response.message = err;
        }
        else {
            response.message= result[0]._id;
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

module.exports = router;
