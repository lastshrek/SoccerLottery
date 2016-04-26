'use strict'

import cheerio from 'cheerio';
import parser from 'co-body';
import request from 'koa-request';
var Matches = require('../models/matches');

export function *home(next) {
  var results = yield Matches.get();
  yield this.render('index', {
    result: results
  })
}
