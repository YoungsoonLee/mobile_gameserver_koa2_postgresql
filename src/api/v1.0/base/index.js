//routes of auth

const Router = require('koa-router');
const base = new Router();
const baseCtrl = require('./base.ctrl');

base.get('/', baseCtrl.healthyCheck);
base.post('/', baseCtrl.healthyCheck);

module.exports = base;
