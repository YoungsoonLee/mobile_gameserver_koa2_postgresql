require('dotenv').config();
const {
  PORT: port,
  MONGO_URI: mongoURI
} = process.env;

const Koa = require('koa');
const cors = require('koa2-cors');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');

const api = require('./api');
const jwtMiddleware = require('lib/auth');

const app = new Koa();

app.use(cors());
app.use(compress());
app.use(jwtMiddleware);
app.use(bodyParser());

//router
const router = new Router();
router.use('/api', api.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
    console.log(`backend server is listening to port ${port}`);
});