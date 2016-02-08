var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/iotGw", {native_parser: true});

var routes = require('./routes/index');
var users = require('./routes/users');
var nodes = require('./routes/nodes');
var events = require('./routes/events');
var map = require('./routes/map');
var contents = require('./routes/contents');
var areas = require('./routes/areas');
var areas = require('./routes/areas');
var template = require('./routes/template');
var content_manager = require('./routes/content_manager');
//var config = require('config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    //console.log(req.connection.remoteAddress);
    req.db = db;
    next();
});
app.use('/', routes);
app.use('/users', users);
app.use('/nodes', nodes);
app.use('/events', events);
app.use('/map', map);
app.use('/contents', contents);
app.use('/areas', areas);
app.use('/template', template);
app.use('/contentManager', content_manager);
app.use('/static', express.static(path.join(__dirname, 'files')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
