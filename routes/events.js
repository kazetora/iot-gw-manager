var express = require('express');
var router = express.Router();
var shortid = require('shortid');

router.get('/:id', function(req, res, next) {
    var db = req.db;
    var targetId = req.params.id;
    db.collection('events').find({node_id: targetId}).toArray(function (err, items) {
        res.json(items);
    });
});

router.post('/addEvent', function(req, res, next) {
    var params = req.body.params;
    var response = {'status':0, message:""};
    var db = req.db;
    var insert_data = {
        node_id: params.id,
        type: params.type, // 001: connect  002: disconnect
        date_create: new Date()
    }
    db.collection('events').insert(insert_data, function(err, result) {
        if(err) {
            response.status = 1;
            response.msg = err;
        }
        res.send(response);
    });
});

module.exports = router;
