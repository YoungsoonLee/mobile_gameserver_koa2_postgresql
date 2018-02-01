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
        updateLoginInfo = await User.updateLogin(user.GameUserID);
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
 * @apiParam {String{1..60}} NickName 
 * @apiParam {String} Locale 
 * @apiParam {String{1..60}} device's UUID
 * @apiParam {Number} OffsetTime timezone을 UTC+x 
 *
 * return: token with GameUserID, GameDeviceUID
 */
exports.registerUser = async (ctx) => {
    const { body } = ctx.request;
    const { NickName, Locale, UUID, OffsetTime } = body;

    const schema = Joi.object({
        NickName: Joi.string().required(), 
        Locale: Joi.string().required(), 
        UUID: Joi.string().required(), 
        OffsetTime: Joi.number().required()
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
        checkUUID = await Device.findByUUID(UUID);
    }catch(e){
        log.error('[UserRegister]','[findByUUID]', UUID, e.message);

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

    if(checkUUID.get('GameUserID') === 0) {
        // check nickname
        let existsNickName = null;
        try{
            // return model
            existsNickName = await User.findByNickName(NickName)
        }catch(e){
            log.error('[UserRegister]','[findByNickName]', NickName, e.message);

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
                registerUser = await User.registerUser(NickName, Locale, OffsetTime)
            }catch(e){
                log.error('[UserRegister]','[registerUser]', NickName, Locale, OffsetTime, e.message);

                ctx.status = 500; // Internal server error
                ctx.body = {
                    message: 'Exception UserRegister registerUser'
                }
                return;
            }

            if(!registerUser){
                // make token
                console.log(registerUser);

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