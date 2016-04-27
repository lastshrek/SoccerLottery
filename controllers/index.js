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
  var odds = yield Matches.getOdds(this.query.match_id);
  yield this.render('odds', {
    odds: odds
  });
}
