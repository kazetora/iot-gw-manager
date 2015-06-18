var express = require('express');
var router = express.Router();
var shortid = require('shortid');

router.get('/', function(req, res, next) {
    var db = req.db;
    db.collection('nodes').find().toArray(function (err, items) {
        res.json(items);
    });
});

router.post('/addNode', function(req, res, next) {
    console.log(req.body);
    var params = req.body.params;
    var response = {status:0, message:""};
    var db = req.db;
    db.collection('nodes').find({name:params.name}).toArray(function(err, items) {
        if(err){
            console.log(err)
        }
        if(items.length > 0) {
            console.error("node exists");
            response.status = 1;
            res.send(response);
        } else {
            var insert_data = {
                'id': shortid.generate(),
                'name': params.name,
                'ip' : "",
                'nat':"" 
            }
            db.collection('nodes').insert(insert_data, function(err, result){
                if(err) {
                    response.status = 1;
                    response.msg = err;
                }
                res.send(response);
            });
        }
    });
});

router.post('/updateNodeIP', function(req, res, next) {
    var params = req.body;
    var response = {'status':0, message:""};
    var db = req.db;
    console.dir(params)
    db.collection('nodes').find({id:params.id}).toArray(function (err, items) {
        if (items.length == 0) {
            console.error("node id not found");
            response.status = 1;
            response.message = "node id not found";
            res.send(response);
        } else {
            var item = items[0];
            item.ip = params.ip;
            item.nat = req.connection.remoteAddress;
            db.collection('nodes').update({'id': item.id}, 
                             item, 
                             function(err, result){
                                 if(err) {
                                     response.status = 1;
                                     response.msg = err;
                                 }
                                 res.send(response);
                             });
        }
    });
});

router.delete('/deleteNode/:id', function(req, res, next) {
    var db = req.db;
    var targetNodeId = req.params.id;
    db.collection('nodes').removeById(targetNodeId, function (err, result){
         res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;
