/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const rooms         = require('./rooms');
const functions     = require('./functions');
const simpleAnswers = require('./simpleAnswers');
let enums;
let adapter;

function getObjectName(lang, obj) {
    if (!obj || !obj.common || !obj.common.name) return '';
    if (typeof obj.common.name === 'object') {
        return obj.common.name[lang] || obj.common.name.en;
    } else {
        return obj.common.name;
    }
}

function findRoom(text, lang) {
    let sRoom = '';
    //noinspection JSUnresolvedVariable
    for (let room in rooms.rooms) {
        //noinspection JSUnresolvedVariable
        if (!rooms.rooms.hasOwnProperty(room)) continue;
        //noinspection JSUnresolvedVariable
        let words = rooms.rooms[room][lang].split('/');
        for (let w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) !== -1) {
                sRoom = room;
                break;
            }
        }
        if (sRoom) break;
    }

    return sRoom;
}

function findFunction(text, lang) {
    let sFunction = '';
    //noinspection JSUnresolvedVariable
    for (let _f in functions.functions) {
        //noinspection JSUnresolvedVariable
        if (!functions.functions.hasOwnProperty(_f)) continue;
        
        //noinspection JSUnresolvedVariable
        let words = functions.functions[_f][lang].split('/');
        for (let w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) !== -1) {
                sFunction = _f;
                break;
            }
        }
        if (sFunction) break;
    }

    return sFunction;
}

function getEnum(enumType, text, enums) {
    enumType = 'enum.' + enumType;
    if (!enums[enumType]) {
        adapter.log.warn('No enum "' + enumType + '" found.');
        return null;
    }
    if (!(text instanceof Array)) {
        text = text.split('/');
    }
    for (let t = 0; t < text.length; t++) {
        if (enums[enumType][enumType + '.' + text[t]]) {
            //noinspection JSUnresolvedVariable
            if (enums[enumType][enumType + '.' + text[t]].common) {
                //noinspection JSUnresolvedVariable
                return enums[enumType][enumType + '.' + text[t]].common.members;
            } else {
                adapter.log.error('Invalid enum object "' + enumType + '.' + text[t] + '"');
                return null;
            }
        }
        // sometimes rooms are in capital
        for (let rId in enums[enumType]) {
            if (!enums[enumType].hasOwnProperty(rId)) continue;
            if (rId.toLowerCase().replace('_', '') === enumType + '.' + text[t]) {
                //noinspection JSUnresolvedVariable
                if (enums[enumType][rId].common) {
                    //noinspection JSUnresolvedVariable
                    return enums[enumType][rId].common.members;
                } else {
                    adapter.log.error('Invalid enum object "' + rId + '"');
                    return null;
                }
            }
        }
    }
    return null;
}

function controlState(lang, obj, value, use01, cb) {
    //noinspection JSUnresolvedVariable
    if (obj.common.write === false) {
        return cb('cannot control');
    }

    // control switch
    //noinspection JSUnresolvedVariable
    if (obj.common.type === 'boolean' || obj.common.role.indexOf('switch') !== -1) {
        if (!use01) value = !!value;

        //noinspection JSUnresolvedVariable
        adapter.log.debug(`Control "${obj._id}"(${getObjectName(lang, obj)}) with ${value}`);

        //noinspection JSUnresolvedVariable, JSUnresolvedFunction
        adapter.setForeignState(obj._id, value, err => {
            err && adapter.log.error(err);
            cb && cb(err);
        });
    } else
    // control level
    //noinspection JSUnresolvedVariable
    if (obj.common.type === 'number' || obj.common.role.indexOf('level') !== -1) {
        if (value === true) {
            //noinspection JSUnresolvedVariable
            value = obj.common.max !== undefined ? obj.common.max : 100;
        } else
        if (value === false) {
            //noinspection JSUnresolvedVariable
            value = obj.common.min !== undefined ? obj.common.min : 0;
        }

        //noinspection JSUnresolvedVariable
        adapter.log.debug(`Control "${obj._id}"(${getObjectName(lang, obj)}) with ${value}`);

        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        adapter.setForeignState(obj._id, value, err => {
            err && adapter.log.error(err);
            cb && cb(err);
        });
    } else {
        //noinspection JSUnresolvedVariable
        adapter.log.warn('Control of "' + obj._id + '" cannot by done, while type "' + obj.common.type + '" does not supported');
        if (cb) cb('invalid type');
    }
}

function controlDevice(lang, id, value, use01, cb) {
    //noinspection JSUnresolvedFunction
    adapter.getForeignObject(id, (err, obj) => {
        if (err) adapter.log.error(err);
        //noinspection JSUnresolvedVariable
        if (obj && obj.common && obj.common.role) {
            //noinspection JSUnresolvedVariable
            if (obj.common.role.indexOf('switch') === -1 &&
                obj.common.role.indexOf('state')  === -1 &&
                obj.common.role.indexOf('level')  === -1 &&
                obj.common.role.indexOf('blind')  === -1) {
                return cb('nothing to control')
            }
            if (obj.type !== 'state') {
                // try to find children
                //noinspection JSUnresolvedFunction
                adapter.getForeignObjects(id + '.*', (err, list) => {
                    if (err) adapter.log.warn(err);
                    if (list) {
                        let id;
                        // first look for direct roles, like: switch, state
                        for (id in list) {
                            if (!list.hasOwnProperty(id)) continue;
                            //noinspection JSUnresolvedVariable
                            if (list[id].type === 'state' && list[id].common.write !== false &&
                                (list[id].common.role === 'switch' ||
                                 list[id].common.role === 'state' ||
                                 list[id].common.role === 'level' ||
                                 list[id].common.role === 'level.dimmer' ||
                                 list[id].common.role === 'level.blind')
                            ) {
                                //noinspection JSUnresolvedVariable
                                if (value === true  && list[id].common.max !== undefined) {
                                    //noinspection JSUnresolvedVariable
                                    value = list[id].common.max;
                                    use01 = true;
                                }
                                //noinspection JSUnresolvedVariable
                                if (value === false && list[id].common.min !== undefined) {
                                    //noinspection JSUnresolvedVariable
                                    value = list[id].common.min;
                                    use01 = true;
                                }
                                controlState(lang, list[id], value, use01, cb);
                                return;
                            }
                        }
                        // first look for copmlex roles, like: switch.light, state.blinds
                        for (id in list) {
                            if (!list.hasOwnProperty(id)) continue;
                            //noinspection JSUnresolvedVariable
                            if (list[id].type === 'state' && list[id].common.write !== false &&
                                (list[id].common.role.indexOf('switch') !== -1 ||
                                 list[id].common.role.indexOf('state')  !== -1 ||
                                 list[id].common.role.indexOf('level')  !== -1)
                            ) {
                                //noinspection JSUnresolvedVariable
                                if (value === true  && list[id].common.max !== undefined) {
                                    //noinspection JSUnresolvedVariable
                                    value = list[id].common.max;
                                    use01 = true;
                                }
                                //noinspection JSUnresolvedVariable
                                if (value === false && list[id].common.min !== undefined) {
                                    //noinspection JSUnresolvedVariable
                                    value = list[id].common.min;
                                    use01 = true;
                                }
                                controlState(lang, list[id], value, use01, cb);
                                return;
                            }
                        }
                    }
                });
            } else {
                //noinspection JSUnresolvedVariable
                if (value === true  && obj.common.max !== undefined) {
                    //noinspection JSUnresolvedVariable
                    value = obj.common.max;
                    use01 = true;
                }
                //noinspection JSUnresolvedVariable
                if (value === false && obj.common.min !== undefined) {
                    //noinspection JSUnresolvedVariable
                    value = obj.common.min;
                    use01 = true;
                }
                controlState(lang, obj, value, use01, cb);
            }

        } else {
            if (!obj) {
                adapter.log.warn('Control of "' + id + '" cannot be done, because object not found');
                if (cb) cb(err || 'object not found');
            } else
            //noinspection JSUnresolvedVariable
            if (obj.common && !obj.common.role) {
                adapter.log.warn('Control of "' + id + '" cannot be done, because role is empty');
                if (cb) cb(err || 'invalid role');
            } else {
                adapter.log.warn('Control of "' + id + '" cannot be done, because invalid object');
                if (cb) cb(err || 'invalid object');
            }
        }
    });
}

function extractOnOff(lang, text) {
    let cmdWords = text.split(' ');
    let valPercent = null;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"

    if (lang === 'ru') {
        // test operation
        if (cmdWords.indexOf('включить') !== -1 || cmdWords.indexOf('включи') !== -1 || cmdWords.indexOf('ключи') !== -1) {
            valPercent = true;
        }
        else
        if (cmdWords.indexOf('выключи') !== -1 || cmdWords.indexOf('выключить') !== -1) {
            valPercent = false;
        }
    }
    else if (lang === 'de') {
        // test operation
        if (cmdWords.indexOf('aus') !== -1 || cmdWords.indexOf('ausmachen') !== -1 || cmdWords.indexOf('ausschalten') !== -1) {
            valPercent = false;
        }
        else
        if (cmdWords.indexOf('an') !== -1 || cmdWords.indexOf('ein') !== -1 || cmdWords.indexOf('einmachen') !== -1 || cmdWords.indexOf('einschalten') !== -1) {
            valPercent = true;
        }
    }
    else if (lang === 'en') {
        // test operation
        if (cmdWords.indexOf('on') !== -1) {
            valPercent = true;
        }
        else
        if (cmdWords.indexOf('off') !== -1) {
            valPercent = false;
        }
    }

    return valPercent;
}

function extractBlindCmd(lang, text) {
    let valPercent = null;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        // test operation
        if (text.indexOf('открыть') !== -1 ||
            text.indexOf('подними') !== -1 ||
            text.indexOf('открой')  !== -1 ||
            text.indexOf('открою')  !== -1 ||
            text.indexOf('поднять') !== -1) {
            valPercent = 100;
        } else
        if (text.indexOf('закрыть')  !== -1 ||
            text.indexOf('закрой')   !== -1 ||
            text.indexOf('закрою')   !== -1 ||
            text.indexOf('опусти')   !== -1 ||
            text.indexOf('опустить') !== -1) {
            valPercent = 0;
        }
    }
    else if (lang === 'de') {
        // test operation
        if (text.indexOf(' auf')        !== -1 ||
            text.indexOf('hoch')        !== -1 ||
            text.indexOf('öffnen')      !== -1 ||
            text.indexOf('aufmachen')   !== -1) {
            valPercent = 100;
        } else
        if (text.indexOf('zumachen')    !== -1 ||
            text.indexOf(' zu')         !== -1 ||
            text.indexOf('schließen')   !== -1 ||
            text.indexOf('runter')      !== -1) {
            valPercent = 0;
        }
    } else
    if (lang === 'en') {
        // test operation
        if (text.indexOf ('open') !== -1) {
            valPercent = 100;
        } else
        if (text.indexOf ('close') !== -1) {
            valPercent = 0;
        }
    }
    return valPercent
}

function generateAnswerOnOff(lang, sRoom, sFunction, valPercent) {
    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        if (valPercent === true) {
            toSay = 'Switch on ';
        } else
        if (valPercent === false) {
            toSay = 'Switch off ';
        } else {
            toSay = 'Set ';
        }
        //noinspection JSUnresolvedVariable
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
        //noinspection JSUnresolvedVariable
        toSay += rooms.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ' to ' + valPercent + ' percent';
        }
    } else
    if (lang === 'de') {
        toSay = (valPercent === true || valPercent === false) ? 'Schalte ' : 'Setze ';
        //noinspection JSUnresolvedVariable
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
        //noinspection JSUnresolvedVariable
        toSay += rooms.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ' auf ' + valPercent + ' Prozent';
        }
        if (valPercent === false) {
            toSay += ' aus';
        } else
        if (valPercent === true) {
            toSay += ' ein';
        }
    } else
    if (lang === 'ru') {
        if (valPercent === true) {
            toSay = 'Включаю ';
        } else
        if (valPercent === false) {
            toSay = 'Выключаю ';
        } else {
            toSay = 'Устанавливаю ';
        }
        //noinspection JSUnresolvedVariable
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
        //noinspection JSUnresolvedVariable
        toSay += rooms.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            let nn = parseFloat(valPercent);
            toSay += ' на ' + valPercent + ' ';
            if (nn > 4 && nn < 21) {
                toSay += 'процентов';
            } else {
                nn = nn % 10;
                if (nn === 1) {
                    toSay += 'процент';
                } else if (nn === 2 || nn === 3 || nn === 4) {
                    toSay += 'процентa';
                } else {
                    toSay += 'процентов';
                }
            }
        }
    }

    return toSay;
}

function generateAnswerBlinds(lang, sRoom, sFunction, valPercent) {
    let toSay;
    valPercent = parseFloat(valPercent);
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        //noinspection JSUnresolvedVariable
        toSay = ((valPercent >= 50) ? 'Open' : 'Close') +
            ' the shutter ' +
            rooms.roomsDative[sRoom][lang] +
            ((valPercent !== 0 && valPercent !== 100) ? ' on ' + valPercent + ' percent': '');
    } else
    if (lang === 'de') {
        //noinspection JSUnresolvedVariable
        toSay = ((valPercent >= 50) ? 'Öffne' : 'Schließe') +
            ' Rollladen ' +
            rooms.roomsDative[sRoom][lang] +
            ((valPercent !== 0 && valPercent !== 100) ? ' auf ' + valPercent + ' Prozent': '');
    } else
    if (lang === 'ru') {
        //noinspection JSUnresolvedVariable
        toSay = ((valPercent >= 50) ? 'Открываю' : 'Закрываю') +
            ' окна ' + rooms.roomsDative[sRoom][lang];

        if (valPercent !== 0 && valPercent !== 1) {
            toSay += ' на ' + valPercent + ' ';
            if (valPercent > 4 && valPercent < 21) {
                toSay += 'процентов';
            } else {
                let nn = valPercent % 10;
                if (nn === 1) {
                    toSay += 'процент';
                } else if (nn === 2 || nn === 3 || nn === 4) {
                    toSay += 'процентa';
                } else {
                    toSay += 'процентов';
                }
            }
        }
    }

    return toSay;
}

function controlByFunctionHelper(lang, text, args, ack, cb, sFunction, extractValue, generateAnswer) {
    // try to extract default room: "some command[default room]"
    let defaultRoom = text.match(/\[(.+)]/);
    if (defaultRoom) {
        text = text.replace(defaultRoom[0], '');
        defaultRoom = defaultRoom[1];
    }

    // try to extract boolean command
    let valPercent  = extractValue(lang, text);

    // find room
    let sRoom = findRoom(text, lang);
    if (!sRoom && defaultRoom) {
        sRoom = findRoom(defaultRoom, lang);
    }

    // find function: e.g "light/dimmer"
    sFunction = sFunction || findFunction(text, lang);

    // Find any number
    let m = text.match(/\b(\d+)\b/);
    if (m) valPercent = parseInt(m[1], 10);

    // Don't know what to do
    if (valPercent === null) { //noinspection JSUnresolvedFunction
        return simpleAnswers.sayNothingToDo(lang, text, args, ack, cb);
    }

    let devicesInRoom = null;
    // try to find enum for room
    if (sRoom !== 'everywhere') {
        devicesInRoom = getEnum('rooms', sRoom, enums);
        // Unknown room
        if (!devicesInRoom) { //noinspection JSUnresolvedFunction
            return simpleAnswers.sayNoSuchRoom(lang, text, args, ack, cb);
        }
    }

    // try to find enum for function
    let devicesInFunction = getEnum('functions', sFunction, enums);
    // Unknown function/role
    if (!devicesInFunction) { //noinspection JSUnresolvedFunction
        return simpleAnswers.sayNoSuchFunction(lang, text, args, ack, cb);
    }

    let anyControlled;
    let toSay = ack ? generateAnswer(lang, sRoom, sFunction, valPercent) : null;

    // if convert true/false to 1/0
    if (args && args[0]) {
        if (valPercent === true)  valPercent = 1;
        if (valPercent === false) valPercent = 0;
    }

    let count = 0;
    if (sRoom === 'everywhere') {
        for (let f = 0; f < devicesInFunction.length; f++) {
            count++;
            controlDevice(lang, devicesInFunction[f], valPercent, (args && args[0]), err => {
                if (!err) anyControlled = true;
                if (!--count) {
                    if (!anyControlled) {
                        //noinspection JSUnresolvedFunction
                        simpleAnswers.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
                    } else {
                        cb(toSay);
                    }
                }
            });
        }
    } else {
        // Try to find overlapping of devicesInRoom and devicesInFunction
        for (let r = 0; r < devicesInRoom.length; r++) {
            if (devicesInFunction.indexOf(devicesInRoom[r]) !== -1) {
                count++;
                controlDevice(lang, devicesInRoom[r], valPercent, (args && args[0]), err => {
                    if (!err) anyControlled = true;
                    setTimeout(() => {
                        if (!--count) {
                            if (!anyControlled) {
                                //noinspection JSUnresolvedFunction
                                simpleAnswers.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
                            } else {
                                cb(toSay);
                            }
                        }
                    }, 100);
                });
            }
        }
    }

    // You don't have this function in this room
    if (!count) { //noinspection JSUnresolvedFunction
        simpleAnswers.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
    }
}

function controlByFunction(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, null, extractOnOff, generateAnswerOnOff);
}

function controlBlinds(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, 'blinds', extractBlindCmd, generateAnswerBlinds);
}

function init(_enums, _adapter) {
    enums = _enums;
    if (_adapter) {
        adapter = _adapter;
    }
}

module.exports = {
    controlBlinds,
    controlByFunction,
    init
};
