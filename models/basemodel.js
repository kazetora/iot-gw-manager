function BaseModel(collection) {
    this.db = null;
    this.collection = collection;
    this._init();
}

BaseModel.prototype._init = function() {
  var mongo = require('mongoskin');
  var db = mongo.db("mongodb://localhost:27017/iotGw", {native_parser: true});
  this.db = db;
};

/*
 * Return first entry
 * @params filter object
 */
BaseModel.prototype.getSingleEntry = function (callback, filter) {
  var _self = this;
  if (typeof filter === 'undefined') {
    filter = {};
  }
  _self.getArray(filter, function(items){
      if(items.length > 0) {
        callback(items[0]);
      }
      else {
        callback({});
      }
  });
}

/*
 * Return first entry
 * @params filter object
 */

BaseModel.prototype.getArray = function (callback, filter) {
  var _self = this;
console.log(_self.collection);
  if (typeof filter === 'undefined') {
    filter = {};
  }
  _self.db.collection(_self.collection).find(filter).toArray(function(err, items){
    if(err){
      console.error(err);
      //return [];
      callback([]);
    }
    else {
      //return items;
      callback(items);
    }
  });
}

module.exports = BaseModel;
