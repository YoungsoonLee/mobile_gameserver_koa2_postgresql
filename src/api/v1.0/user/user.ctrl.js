const Joi = require('joi');
const bookshelf = require('db');

const User = require('db/models/GameUser');
const Device = require('db/models/GameDevice');
const commonFunc = require('lib/commFunc');
const log = require('lib/log');
//const customError = require('lib/error');
//const auth = require('lib/auth');


/**
 * @api {GET} /user getUserInfo
 * @apiName getUserInfo
 * @apiHeader {String} retuest Authorization JWT token
 */
exports.getUserInfo = async (ctx) => {
    // update login info
    const { user } = ctx.request;

    if(!user) {
        ctx.status = 403;
        ctx.body = {
            message: 'need valid token'
        }
        return;
    }

    let updateLoginInfo = null;
    try {
        //returned JSON
        updateLoginInfo = await User.updateLogin(user.game_user_id);
    } catch (e) {
        log.error('[getUserInfo]','[updateLogin]', user, e.message);

        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception getUserInfo updateLogin'
        }
        return;
    }

    ctx.body = {
        userinfo: updateLoginInfo
    };
    return;

}


/**
 * @api {POST} /user register user
 * @apiName register device
 * @apiParam {String{1..60}} nickname 
 * @apiParam {String} locale 
 * @apiParam {String{1..60}} device's uuid
 * @apiParam {Number} offset_time timezone을 UTC+x 
 *
 * return: token with game_user_id, game_device_id
 */
exports.registerUser = async (ctx) => {
    const { body } = ctx.request;
    const { nickname, locale, uuid, offset_time } = body;

    const schema = Joi.object({
        nickname: Joi.string().required(), 
        locale: Joi.string().required(), 
        uuid: Joi.string().required(), 
        offset_time: Joi.number().required()
      });

    const result = Joi.validate(body, schema);
    
    // error schema
    if(result.error) {
        ctx.status = 400;
        ctx.body = {
            message: result.error.details[0].message
        }
        return;
    }

    let checkUUID = null;
    try{
        // return model
        checkUUID = await Device.findByUUID(uuid);
    }catch(e){
        log.error('[UserRegister]','[findByUUID]', uuid, e.message);

        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception UserRegister findByUUID'
        }
        return;
    }

    if(!checkUUID) {
        ctx.status = 400;
        ctx.body = {
            message: 'need register device first'
        }
        return;
    }

    if(checkUUID.get('game_user_id') === 0) {
        // check nickname
        let existsNickName = null;
        try{
            // return model
            existsNickName = await User.findByNickName(nickname)
        }catch(e){
            log.error('[UserRegister]','[findByNickName]', nickname, e.message);

            ctx.status = 500; // Internal server error
            ctx.body = {
                message: 'Exception UserRegister findByNickName'
            }
            return;
        }

        if(existsNickName) {
            ctx.status = 403; 
            ctx.body = {
                message: 'Already exists NickName'
            }
            return;
        }else{
            // user register
            let registerUser = null;
            try{
                // return JSON
                registerUser = await User.registerUser(nickname, locale, uuid, offset_time)
            }catch(e){
                log.error('[UserRegister]','[registerUser]', nickname, locale, uuid, offset_time, e.message);

                ctx.status = 500; // Internal server error
                ctx.body = {
                    message: 'Exception UserRegister registerUser'
                }
                return;
            }

            //console.log(registerUser);

            if(registerUser !== null){
                // make token
                ctx.status = 201; 
                ctx.body = {
                    registerUser
                }
                return;

            }else{
                ctx.status = 500; // Internal server error
                ctx.body = {
                    message: 'Exception UserRegister registerUser is null'
                }
                return;
            }

        }

    }else{
        // already registerd user
        // make token or return error? -> first error
        ctx.status = 403; 
        ctx.body = {
            message: 'already registered'
        }
        return;
    }

}