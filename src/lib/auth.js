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
module.exports = async (ctx, next) => {
    const token = ctx.request.headers.authorization;
    if(!token) { 
        // if there is no token, skip!
        ctx.request.user = null;
        return next(); 
    }

    try{
        jwt.verify(token, SECRET, (err, decoded)=>{
            if(err) {
                ctx.request.user = null;
            }
            else {
                // Attach user to request
                // request에 user정보를 포함하여 전송한다.
                ctx.request.user = {
                    game_user_id:decoded.game_user_id,
                    game_device_id:decoded.game_device_id
                };
            }
        });
    }catch(e){
        ctx.request.user = null;
    }   
    return next(); 

    
}