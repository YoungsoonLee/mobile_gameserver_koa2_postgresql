'use strict'

const debug = require('debug')('utils:auth');

const jwt = require('jsonwebtoken');
///!!!반드시 외부에 노출되는 코드에는 secret을 직접 적지 않아야한다!!!
const SECRET       = process.env.AuthSECRET || "secret";
const EXPIRES = 3600; // 1 hour

// JWT 토큰 생성 함수
function signToken(body) {
    return jwt.sign(body, SECRET, { expiresIn: EXPIRES });
}

exports.signToken = signToken;

exports.decodeToken = (token) =>{
    let decode = jwt.decode(token);
    return decode;
}

/**
 * JWT 토큰을 검증할 때 사용된다.
 */
exports.isAuthenticated = async (ctx, next) => {
    debug('isAuthenticated');
    jwt.verify(ctx.request.headers.authorization, SECRET, (err, decoded)=>{
        if(err) {
            // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
            //res.status(401).send('The request has not been applied because it lacks valid authentication credentials for the target resource.')
            ctx.status = 401;
            ctx.body = {
                message: 'he request has not been applied because it lacks valid authentication credentials for the target resource.'
            }
            return;
        }
        else {
            // Attach user to request
            // request에 user정보를 포함하여 전송한다.
            ctx.request.user = {
                GameUserID:decoded.GameUserID,
                GameDeviceUID:decoded.GameDeviceUID
            };
            return next();
        }
    });
}