function BaseModel(collection) {
    this.db = null;
    this.collection = collection;
    this._init();
}

BaseModel.prototype._init = function() {
  var mongo = require('mongoskin');
  var db = mongo.db("mongodb://localhost:27017/iotGw", {native_parser: true});
  this.db = db;
}

/*
 * Return first entry
 * @params filter object
 * @return object
 */
BaseModel.prototype.getSingleEntry = function (filter) {
  var _self = this;
  if (typeof filter === 'undefined') {
    filter = {};
  }
  var items = _self.getArray(filter);
  if(items.length > 0) {
    return items[0];
  }
  else {
    return {};
  }
}

/*
 * Return first entry
 * @params filter object
 * @return array
 */

BaseModel.prototype.getArray = function (filter) {
  var _self = this;

  if (typeof filter === 'undefined') {
    filter = {};
  }
  db.collection(_self.collection).find(filter).toArray(function(err, items){
    if(err){
      console.error(err);
      return [];
    }
    else {
      return items;
    }
};

module.exports = BaseModel;
