const moment = require('moment');
var bookshelf = require('db');
//bookshelf.plugin('pagination');

var GameDevice = bookshelf.Model.extend({
    tableName: 'game_device',
    idAttribute: 'game_device_id'
},{
    //static methods
    findByUUID: function(uuid){
        return  this.where({ uuid }).first();
    },
    addDevice: function(uuid, device_type) {
        return new Promise(function(resolve, reject) {
            new GameDevice().save(
                {
                    uuid,
                    device_type,
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
