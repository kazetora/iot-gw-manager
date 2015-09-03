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
        'coords': params.coords,
        'cuids' : params.cuids
    }
    db.collection('areas').insert(insert_data, function(err, result){
        if(err) {
            response.status = 1;
            response.msg = err;
        }
        res.send(response);
    });
});

router.delete('/deleteArea', function(req, res, next) {
    var db = req.db;
    var targetId = req.body.ids;
    db.collection('areas').removeById(targetId, function (err, result){
         res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
