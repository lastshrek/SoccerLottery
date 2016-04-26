'use strict';

var Router = require('koa-router')
  , _requiredir = require('require-dir');

const controllers = _requiredir('./controllers');

module.exports = function() {
  const router = Router();

  router.get('/', controllers.index.home);
  router.get('/odds', controllers.index.odds);

  return router;
}
