//routes of auth

const Router = require('koa-router');
const user = new Router();
const userCtrl = require('./user.ctrl');

const auth = require('lib/auth')

// GET get user info
user.get('/', userCtrl.getUserInfo);
user.post('/', userCtrl.registerUser);

module.exports = user;
