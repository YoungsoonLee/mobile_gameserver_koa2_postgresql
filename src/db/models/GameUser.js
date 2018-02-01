const moment = require('moment');
var bookshelf = require('db');
//bookshelf.plugin('pagination');

const GameDevice = require('./GameDevice')

var GameUser = bookshelf.Model.extend({
    tableName: 'GameUser',
    idAttribute: 'GameUserID'
},{
    //static methods
    updateLogin: function(GameUserID) {
        return new Promise(function(resolve, reject) {
            new GameUser({ GameUserID })
                .save({
                    loginAt: provider
                })
                .then((user)=>{
                    resolve(user.toJSON());
                })
                .catch((err)=>{
                    console.log('[updateLogin] updateLogin error: ', err);
                    reject(err);
                });
        });
    },
    findByNickName: function(NickName) {
        return  this.where({ NickName }).first();
    },
    registerUser: function(NickName, Locale, UUID, OffsetTime) {
        return new Promise(function(resolve, reject) {
            new GameUser().save(
                {
                    NickName,
                    Locale,
                    OffsetTime
                }
            ).then(function(gameuser) {
                // update GameDevice
                new GameDevice({UUID}).save({
                    GameUserID: gameuser.get('GameUserID')
                })
                .then((device)=>{
                    resultData = {
                        GameUserID: gameuser.get('GameUserID'),
                        GameDeviceID: device.get('GameDeviceUID')
                    }
                    resolve(resultData);
                })
                .catch((err)=>{
                    console.log('[registerUser] update gamedevice error: ', err);
                    reject(err);
                });


            }).catch(function(err) {
                reject(err);
            });
        });
    }
});

module.exports = GameUser;
