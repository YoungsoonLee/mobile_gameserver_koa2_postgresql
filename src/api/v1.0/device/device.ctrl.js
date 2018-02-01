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
 * @apiParam {String{1..60}} device UUID
 * @apiParam {Number} DeviceType 1:aOS, 2:iOS, 10:UnityEditor
 */
exports.deviceRegister = async (ctx) => {
    const { body } = ctx.request;
    const { UUID, DeviceType } = body;

    const schema = Joi.object({
        UUID: Joi.string().required(), 
        DeviceType: Joi.number().integer().required()
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
        existing = await Device.findByUUID(UUID);
    } catch (e) {
        log.error('[DeviceRegister]','[findByUUID]', UUID, e.message);

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
            addDevice = await Device.addDevice(UUID, DeviceType)
        }catch(e){
            log.error('[DeviceRegister]','[addDevice]', UUID, DeviceType, e);

            ctx.status = 500; // Internal server error
            ctx.body = {
                message: 'Exception DeviceRegister addDevice'
            }
            return;
        }

        if(addDevice){
            ctx.body = {
                UUID: addDevice.UUID,
                DeviceType: addDevice.DeviceType
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
        UUID,
        DeviceType
    };
    return;
}

/**
 * @api {GET} /device/token/:UUID request token
 * @apiName request token
 * @apiParam {String{1..60}} device's UUID
 */
exports.getToekn = async (ctx) => {
    const { UUID } = ctx.params;

    /* Check already registerd Device with UUID */
    let existing = null;
    try {
        //returned model
        existing = await Device.findByUUID(UUID);
    } catch (e) {
        log.error('[getToekn]','[findByUUID]', UUID, e.message);

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
        if ( existing.get('GameUserID') === 0){
            ctx.status = 400; 
            ctx.body = {
                message: 'Error registered device but userid is null'
            }
            return;
        }

        if ( !existing.get('MainFlag')){
            ctx.status = 400; 
            ctx.body = {
                message: 'Error registered device but not main device'
            }
            return;
        }

        let tokenObj = {
            GameUserID:existing.GameUserID, 
            GameDeviceUID:existing.GameDeviceUID
        };
        let token = auth.signToken(tokenObj);
        
        ctx.body = {
            token
        }
        return;

    }

}