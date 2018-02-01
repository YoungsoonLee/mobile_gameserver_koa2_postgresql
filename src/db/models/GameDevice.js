const moment = require('moment');
var bookshelf = require('db');
//bookshelf.plugin('pagination');

var GameDevice = bookshelf.Model.extend({
    tableName: 'GameDevice',
    idAttribute: 'GameDeviceUID'
},{
    //static methods
    findByUUID: function(UUID){
        return  this.where({ UUID: UUID }).first();
    },
    addDevice: function(UUID, DeviceType) {
        return new Promise(function(resolve, reject) {
            new GameDevice().save(
                {
                    UUID,
                    DeviceType,
                }
            ).then(function(GameDevice) {
                resolve(GameDevice.toJSON());
            }).catch(function(err) {
                reject(err);
            });
        });
    }
});

module.exports = GameDevice;
