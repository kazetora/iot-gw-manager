require('https').globalAgent.options.rejectUnauthorized = false;
var moment = require("moment");
var io = require("socket.io-client");
var shortid = require('shortid');

function BCNews(params){
  this.api_server = params.api_server;
  this.area_server = params.area_server;
  this.target_group = params.target_group;
  this.img_api_path = this.api_server + "/mob/api/v1/images";
  this.delivery_timespan = (typeof params.delivery_timespan != "undefined") ? params.delivery_timespan : 30;
  this.title = (typeof params.title != "undefined") ? params.title : null;
  this.body = (typeof params.body != "undefined") ? params.body: null;
  this.img_url = (typeof params.img_url != "undefined") ? params.img_url : null;
  this.img_id = (typeof params.img_id != "undefined") ? params.img_id : null;
  this.link_url = (typeof params.link_url != "undefined") ? params.link_url : null;
  this.link_id = (typeof params.link_id != "undefined") ? params.link_id : null;
  this.icon_url = (typeof params.icon_url != "undefined") ? params.icon_url : null;
  this.icon_id = (typeof params.icon_id != "undefined") ? params.icon_id : null;
  this.video_url = (typeof params.video_url != "undefined") ? video_url : null ;
  this.video_id = (typeof params.video_id != "undefined") ? video_id : null ;
  this.tmp_img_file = null;
  this.tmp_img_type = null;
  this.restclient = null;
  this.content_id = null;
  this.delivery_id = null;
  this.socket = null;
  this.init();
}

BCNews.prototype.updateFields = function(params){
  console.log(params);
  this.target_group = params.target_group;
  this.delivery_timespan = (typeof params.delivery_timespan != "undefined") ? params.delivery_timespan : 30;
  this.title = params.title;
  this.body = params.body;
  this.img_url = (typeof params.img_url != "undefined") ? params.img_url : null;
  this.img_id = (typeof params.img_id != "undefined") ? params.img_id : null;
  this.link_url = (typeof params.link_url != "undefined") ? params.link_url : null;
  this.link_id = (typeof params.link_id != "undefined") ? params.link_id : null;
  this.icon_url = (typeof params.icon_url != "undefined") ? params.icon_url : null;
  this.icon_id = (typeof params.icon_id != "undefined") ? params.icon_id : null;
  this.video_url = (typeof params.video_url != "undefined") ? params.video_url : null ;
  this.video_id = (typeof params.video_id != "undefined") ? params.video_id : null ;
  this.tmp_img_file = null;
  this.tmp_img_type = null;
}

BCNews.prototype.init = function() {
  var _self = this;
  var content_url = _self.api_server + "/cms/api/v1/contents";
  var content_type_url = content_url + "/${type}";
  var content_cuid_url = content_type_url + "/${cuid}";
  var delivery_url = _self.api_server + "/cms/api/v1/deliveries";
  var link_url_api = _self.api_server + "/mob/api/v1/surls";
  var reg_news_url = content_url + "/auto_news";

  var update_area_url = _self.area_server + "/areas/updateContentCuids/${area_id}";

  var Client = require('node-rest-client').Client;
  _self.restclient = new Client();

  _self.restclient.registerMethod("registerContent", reg_news_url, "POST");
  _self.restclient.registerMethod("registerDelivery", delivery_url, "POST");
  _self.restclient.registerMethod("registerLink", link_url_api, "POST");
  _self.restclient.registerMethod("updateAreaCuids", update_area_url, "POST");
  _self.restclient.registerMethod("updateContent", content_cuid_url, "PUT");
  _self.restclient.registerMethod("getAllContent", content_type_url, "GET");
  _self.init_socket();
}

BCNews.prototype.init_socket = function(){
  var _self = this;
  var socketOptions = {
      "secure": true,
      "transports": [ "websocket" ],
      "try multiple transports": false,
      "reconnect": false,
      "force new connection": true,
      "connect timeout": 10000
  };
  _self.socket = io.connect(_self.area_server, socketOptions);
}

BCNews.prototype.downloadImage = function(uri, callback){
  var _self = this;
  var fs = require('fs'),
      request = require('request');

  request.head(uri, function(err,res,body){
    if(err) {
      console.error(err);
      return callback();
    }
    console.log('content-type:', res.headers['content-type']);
    //_self.tmp_img_type = res.headers['content-type'];
    _self.tmp_img_type = "image/jpeg";
    console.log('content-length:', res.headers['content-length']);
    _self.tmp_img_file = shortid.generate();
    request(uri).pipe(fs.createWriteStream("./img/" + _self.tmp_img_file)).on('close', callback);
  });
}

BCNews.prototype.uploadImage = function(callback) {
  var _self = this;
  if(!_self.tmp_img_file || (_self.tmp_img_type !== "image/jpeg" && _self.tmp_img_type !== "image/png" && _self.tmp_img_type !== "image/gif")) {
    return callback();
  }
  var fs = require('fs'),
      request = require('request');

  var req = request.post(_self.img_api_path, function(err, resp, body){
    if(err){
      console.log('Error: ' + err);
      return callback();
    } else {
      console.log(body);
      _self.tmp_img_file = null;
      _self.tmp_img_type = null;
      try {
          var ret = JSON.parse(body);
          callback(JSON.parse(body));
      } catch(err) {
          console.log(err.stack);
          return callback();
      }
    }
  });
  var form = req.form();
  form.append('file', fs.createReadStream("./img/" + _self.tmp_img_file), {
    contentType: _self.tmp_img_type
  });
  //callback();
}

BCNews.prototype.registerContentImage = function(callback) {
  console.log("register image");
  var _self = this;
  if(this.img_id){
    return callback();
  }
  else {
    _self.downloadImage(_self.img_url, function(){
      console.log("Downloaded: " + _self.tmp_img_file);
      _self.uploadImage(function(data){
        if(typeof data == 'undefined' || data == null) {
          return callback();
        }
        _self.img_id = data.iuid;
        console.log(_self.img_id);
        callback();
      });
    });
  }
}

BCNews.prototype.registerContentIcon = function(callback) {
  console.log("register icon");
  var _self = this;
  if(_self.icon_id){
    return callback();
  }
  else {
    _self.downloadImage(_self.icon_url, function(){
      console.log("Downloaded: " + _self.tmp_img_file);
      _self.uploadImage(function(data){
        if(typeof data == 'undefined' || data == null) {
          return callback();
        }
        _self.icon_id = data.iuid;
        console.log(_self.img_id);
        callback();
      });
    });
  }
}

BCNews.prototype.registerContentVideo = function(callback) {
  var _self = this;
  if(_self.video_id){
    return callback();
  }
  else {
    // TODO: register video (get value for video_id)
    // for now do nothing
    return callback();
  }
}

BCNews.prototype.registerContentLink = function(callback) {
  var _self = this;
  if(_self.link_id){
    return callback();
  }
  else {
    var args = {
      data: {
        url: _self.link_url
      },
      headers: {"Content-Type": "application/json"}
    };
    _self.restclient.methods.registerLink(args, function(data, response){
      //console.log(data);
      _self.link_id = data.suid;
      callback();
    });
  }
}

BCNews.prototype.registerContent = function(callback) {
  var _self = this;
  // TODO: different types of link
  var content = {
    cuid: null,
    is_raw: false,
    status: "published",
    version: 0,
    category: 1,
    data: {
      title: _self.title,
      body: _self.body,
      icon: _self.icon_id,
      image: _self.img_id,
      video: _self.video_id,
      link: {
        data: _self.link_id,
        link_type: _self.link_id ? "url": "none"
      }
    }
  };
  //console.log(content);
  var args = {
    data: content,
    headers: {"Content-Type": "application/json"}
  };
  _self.restclient.methods.registerContent(args, function(data, response){
    _self.content_id = data.cuid;
    callback();
  });
}

BCNews.prototype.updateContent = function(params, callback) {
   var _self = this;
   var content = {
       cuid: params.cuid ? params.cuid : _self.cuid,
       is_raw: false,
       status: "published",
       version: 0,
       category: 1,
       data: {
         title: params.title ? params.title : _self.title,
         body: params.body ? params.body : _self.body,
         icon: params.icon ? params.icon : _self.icon_id,
         image: params.image ? params.image : _self.img_id,
         video: params.video ? params.video : _self.video_id,
         link: {
           data: params.link_id ? params.link_id : _self.link_id,
           link_type: params.link_type ? params.link_type : 'none'
         }
       }
   };
  var args = {
    path: {type: params.type, cuid: params.cuid},
    data: content,
    headers: {"Content-Type": "application/json"}
  };
  _self.restclient.methods.updateContent(args, function(data, response){
    callback(data);
  });
}

BCNews.prototype.getAllContent = function(type, callback) {
    var _self = this;
    var args = {
        path: {type: type},
        parameters: {count:1},
        headers: {"Content-Type": "application/json"}
    };
    var ret = [];
    var h = {};
    var each = require('async-each-series');
    _self.restclient.methods.getAllContent(args, function(cnt, respons) {
        //callback(data);
        console.log(cnt);
        var data_cnt = cnt['n']
        var iterate = function(i, done) {
            console.log("Iteration #", i);
            if(i*100 >= data_cnt + 100) {
                return done();
            }
            args['parameters'] = {page: i, per_page: 100};
            _self.restclient.methods.getAllContent(args, function(sub, res){
                each(sub, function(el,next){
                   if(!(el['cuid'] in h)) {
                       h[el['cuid']] = 1;
                       ret.push(el);
                   }
                   else{
                       console.log("Duplicate detected");
                   }
                   next();
                }, function(err){
                    if(err) {
                        console.err(err);
                        return done();
                    }
                    iterate(++i, done);
                });
            });
        };

        iterate(1, function(){
            callback(ret);
        });

    });
}

BCNews.prototype.registerContentDelivery = function(callback) {
  var _self = this;
  var delivery = {
    cuid: _self.content_id,
    status: "active",
    priority: "be",
    coding_factor: 2,
    areas: [_self.target_group],
    btime: moment(Date.now()).format(),
    etime: moment(Date.now()).add(_self.delivery_timespan, 'seconds').format(),
    duration: 60,
    repeat_interval: 60,
    tx_interval_min: 20
  };
  console.log(delivery);
  //callback();
  var args = {
    data: delivery,
    headers: {"Content-Type": "application/json"}
  };
  _self.restclient.methods.registerDelivery(args, function(data, response){
    console.log(data);
    _self.delivery_id = data.cid;
    callback();
  });
}
BCNews.prototype.register = function(params, targetAreaID, cb) {
  var async = require('async');
  var seriescallback = [];
  var _self = this;
  _self.updateFields(params);

  if(params.img_url) {
    //console.log("img: " + _self.img_url)
    seriescallback.push(function(callback){
      _self.registerContentImage(callback);
    });
  }
  if(params.icon_url) {
    seriescallback.push(function(callback){
      _self.registerContentIcon(callback);
    });
  }
  if(params.link_url) {
    seriescallback.push(function(callback){
      _self.registerContentLink(callback);
    });
  }
  if(params.video_url) {
    seriescallback.push(function(callback){
      _self.registerContentVideo(callback);
    });
  }

  seriescallback.push(function(callback){
    _self.registerContent(callback);
  });

  seriescallback.push(function(callback){
    _self.registerContentDelivery(callback);
  });

  if(typeof targetAreaID !== 'undefined' && targetAreaID.length > 0) {
    seriescallback.push(function(callback){
      _self.registerTargetArea(targetAreaID, callback);
    });
  }

  async.series(seriescallback, function(err){
    if(err) {
      console.error(err);
      if(typeof cb !== 'undefined' && cb) {
        cb();
      }
    } else {
      console.log("register content cuid: " + _self.content_id + ", delivery cid: " + _self.delivery_id);
      if(typeof cb !== 'undefined' && cb) {
        cb();
      }
    }
  });
}

BCNews.prototype.registerTargetArea = function(areaID, callback) {
  var _self = this;
  var args = {
    data: {"cuids": [_self.content_id]},
    path:{"area_id": areaID},
    headers:{"Content-Type": "application/json"}
  }
  _self.restclient.methods.updateAreaCuids(args, function(data, response){
    //console.log(data);
    _self.socket.emit("area/fetch_update", areaID)
    callback();
  });
}

module.exports = BCNews;

var run = function(){

  var params = {
    api_server: 'https://bccs.nakao-lab.org',
    area_server: 'https://133.11.240.227:3000',
    target_group: "eeb4avkC",
    delivery_timespan: 180,
    title: 'This is new auto',
    body: 'This is spartaaaa',
    img_url: 'https://www.google.com/images/srpr/logo3w.png',
    link_url: 'https://en.wikipedia.org/wiki/Main_Page',
    icon_id: 'y0s5VEkm'
    //icon_url: 'http://www.megaicons.net/static/img/icons_title/29/141/title/search-pointer-icon.png'
  }
  var news = new BCNews(params);
  news.register(params, 'EkNPpeG8l');
  //news.registerContentIcon(function(){console.log("done");});
}

if(require.main === module) {
    run();
}
