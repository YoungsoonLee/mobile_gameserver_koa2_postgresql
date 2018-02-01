const moment = require('moment');
var bookshelf = require('db');
//bookshelf.plugin('pagination');

const GameDevice = require('./GameDevice')

var GameUser = bookshelf.Model.extend({
    tableName: 'game_user',
    idAttribute: 'game_user_id'
},{
    //static methods
    updateLogin: function(game_user_id) {
        return new Promise(function(resolve, reject) {
            new GameUser({ game_user_id })
                .save({
                    login_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
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
    findByNickName: function(nickname) {
        return  this.where({ nickname }).first();
    },
    registerUser: function(nickname, locale, uuid, offset_time) {
        console.log("registerUser: ", nickname, locale, uuid, offset_time)
        return new Promise(function(resolve, reject) {
            new GameUser().save(
                {
                    nickname,
                    locale,
                    offset_time
                }
            ).then(function(user) {
                // update GameDevice
                new GameDevice({uuid}).fetch().then((device)=>{
                    device.set('game_user_id', user.get('game_user_id'));
                    device.save(device.changed, {patch: true}).then(function() {
                        resultData = {
                            game_user_id: user.get('game_user_id'),
                            game_device_id: device.get('game_device_id')
                        }
                        resolve(resultData);
                    }).catch(function(err) {
                        console.log('[update Profile] save update reset password error: ', err);
                        reject(err);
                    });
                }).catch((err)=>{
                    console.log('[update Profile] fetch reset password error: ', err);
                    reject(null);
                });

            }).catch(function(err) {
                reject(err);
            });
        });
    }
});

module.exports = GameUser;
