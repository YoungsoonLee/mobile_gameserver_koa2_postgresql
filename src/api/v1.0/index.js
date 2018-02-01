const Router = require('koa-router');
const base = require('./base');
const user = require('./user');
const device = require('./device');

const api = new Router();

api.use('/base', base.routes());
api.use('/device', device.routes());
api.use('/user', user.routes());

module.exports = api;
