'use strict'

import cheerio from 'cheerio';
import parser from 'co-body';
import request from 'koa-request';
var Matches = require('../models/matches');

export function *home(next) {
  var results = yield Matches.get();
  yield this.render('index', {
    result: results
  });
}

export function *odds(next) {
  var matchInfo = yield Matches.getOdds(this.query.match_id , this.query.date, this.query.h, this.query.a);
  yield this.render('odds', {
    matchInfo: matchInfo
  });
}
