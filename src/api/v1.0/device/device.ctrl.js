const Joi = require('joi');
const bookshelf = require('db');

const Device = require('db/models/GameDevice');
const commonFunc = require('lib/commFunc');
const log = require('lib/log');
//const customError = require('lib/error');
const auth = require('lib/auth');

/**
 * @api {POST} /
 * @apiName mobile device register
 * @apiParam {String{1..60}} device uuid
 * @apiParam {Number} device_type 1:aOS, 2:iOS, 10:UnityEditor
 */
exports.deviceRegister = async (ctx) => {
    const { body } = ctx.request;
    const { uuid, device_type } = body;

    const schema = Joi.object({
        uuid: Joi.string().required(), 
        device_type: Joi.number().integer().required()
      });

    const result = Joi.validate(body, schema);
    
    // 스키마 검증 실패
    if(result.error) {
        ctx.status = 400;
        ctx.body = {
            message: result.error.details[0].message
        }
        return;
    }

    /* example code on study website
    let checkRequestBody = commonFunc.ObjectExistThatKeys(body, ['UUID', 'DeviceType']);
    if(checkRequestBody === false) {
        throw wendyError('DontHaveRequiredParams');
    }
    */
    
    /* Check already registerd Device with UUID */
    let existing = null;
    try {
        //returned model
        existing = await Device.findByUUID(uuid);
    } catch (e) {
        log.error('[DeviceRegister]','[findByUUID]', uuid, e.message);

        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception DeviceRegister findByUUID'
        }
        return;
    }

    if(!existing) {
        // add new device. addDevice(UUID, DeviceType)
        let addDevice = null;
        try{
            addDevice = await Device.addDevice(uuid, device_type)
        }catch(e){
            log.error('[DeviceRegister]','[addDevice]', uuid, device_type, e);

            ctx.status = 500; // Internal server error
            ctx.body = {
                message: 'Exception DeviceRegister addDevice'
            }
            return;
        }

        if(addDevice){
            ctx.body = {
                uuid: addDevice.uuid,
                device_type: addDevice.device_type
            };
            return;
        }else{
            log.error('[DeviceRegister]','[addDevice]', 'addDevice result is null');

            ctx.status = 500; // Internal server error
            ctx.body = {
                message: 'Exception DeviceRegister addDevice is null'
            }
            return;
        }

    }

    ctx.body = {
        uuid,
        device_type
    };
    return;
}

/**
 * @api {GET} /device/token/:uuid request token
 * @apiName request token
 * @apiParam {String{1..60}} device's uuid
 */
exports.getToekn = async (ctx) => {
    const { uuid } = ctx.params;

    /* Check already registerd Device with UUID */
    let existing = null;
    try {
        //returned model
        existing = await Device.findByUUID(uuid);
    } catch (e) {
        log.error('[getToekn]','[findByUUID]', uuid, e.message);

        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception getToekn findByUUID'
        }
        return;
    }

    if(!existing) {
        ctx.status = 400; 
        ctx.body = {
            message: 'Error Unregistered Device'
        }
        return;
    }else{
        if ( existing.get('game_user_id') === 0){
            ctx.status = 400; 
            ctx.body = {
                message: 'Error registered device but userid is null'
            }
            return;
        }

        if ( !existing.get('main_flag')){
            ctx.status = 400; 
            ctx.body = {
                message: 'Error registered device but not main device'
            }
            return;
        }

        let tokenObj = {
            game_user_id: existing.game_user_id,
            game_device_id: existing.game_device_id
        };
        let token = auth.signToken(tokenObj);
        
        ctx.body = {
            token
        }
        return;

    }

}