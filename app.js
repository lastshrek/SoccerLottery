var babel_register = require('babel-register');
var app = require('koa')()
  , koa = require('koa-router')()
  , logger = require('koa-logger')
  , json = require('koa-json')
  , views = require('koa-views')
  , onerror = require('koa-onerror')
  , routers = require('./routers');

app.use(function*(next){
  try{
    yield next;
  }
  catch(err){
    console.log(err.stack);
  }
});
app.use(views('views', {
  root: __dirname + '/views',
  default: 'jade'
}));
app.use(require('koa-bodyparser')());
app.use(json());
app.use(logger());


app.use(require('koa-static')(__dirname + '/public'));

// mount root routes
app.use(routers().routes());

app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
});

module.exports = app;
