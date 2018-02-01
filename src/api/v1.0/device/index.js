//routes of auth

const Router = require('koa-router');
const device = new Router();
const deviceCtrl = require('./device.ctrl');

// POST regider device
device.post('/', deviceCtrl.deviceRegister);
device.get('/token/:UUID', deviceCtrl.getToekn);

module.exports = device;
