require('https').globalAgent.options.rejectUnauthorized = false;


function BeaconcastContent(params) {
  this.api_server = params.api_server;
  this.restclient = null;
  this.content_get_url =  content_url = this.api_server + "/cms/api/v1/contents/";
  this.init();
}

BeaconcastContent.prototype.init = function() {
  var _self = this;
  var Client = require('node-rest-client').Client;
  _self.restclient = new Client();

  //_self.restclient.registerMethod("registerContent", content_url, "GET");
}

BeaconcastContent.prototype.getContents = function (params, callback) {
  var _self = this;

  var ctype = params.ctype;
  var url = _self.content_get_url + ctype
  var cuid = (typeof params.cuid != 'undefined') ? params.cuid : null;

  if(cuid ) {
      url += "/" + cuid;
  }
  console.log(url);
  var args = {
    headers: { "Content-Type": "application/json" }
  }

  if(typeof params.url_params != 'undefined') {
    args['parameters'] = params.url_params;
  }

  var request = _self.restclient.get(url, args, function(data, response){
    if(!Array.isArray(data)) {
      data = [data];
    }

    if(typeof params.keyword != 'undefined') {
      var _ = require("underscore");
      data = _.filter(data, function(entry){
        //console.log(entry);
        return entry.data.title.indexOf(params.keyword) > -1 || entry.data.body.indexOf(params.keyword) > -1;
      });
    }

    callback(null, data);
  });

  request.on("error", function(err){
    callback(err);
  });

};

module.exports = BeaconcastContent;
