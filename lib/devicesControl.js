var rooms         = require(__dirname + '/rooms');
var functions     = require(__dirname + '/functions');
var simpleAnswers = require(__dirname + '/simpleAnswers');
var enums;
var adapter;

function findRoom(text, lang) {
    var sRoom = '';
    for (var room in rooms.rooms) {
        var words = rooms.rooms[room][lang].split('/');
        for (var w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) != -1) {
                sRoom = room;
                break;
            }
        }
        if (sRoom) break;
    }

    return sRoom;
}

function findFunction(text, lang) {
    var sFunction = '';
    for (var _f in functions.functions) {
        var words = functions.functions[_f][lang].split('/');
        for (var w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) != -1) {
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
    text = text.split('/');
    for (var t = 0; t < text.length; t++) {
        if (enums[enumType][enumType + '.' + text[t]]) {
            if (enums[enumType][enumType + '.' + text[t]].common) {
                return enums[enumType][enumType + '.' + text[t]].common.members;
            } else {
                adapter.log.error('Invalid enum object "' + enumType + '.' + text[t] + '"');
                return null;
            }
        }
        // sometimes rooms are in capital
        for (var rId in enums[enumType]) {
            if (rId.toLowerCase().replace('_', '') == enumType + '.' + text[t]) {
                if (enums[enumType][rId].common) {
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

function controlState(obj, value, cb) {
    if (obj.common.write === false) return cb('cannot control');

    // control switch
    if (obj.common.type === 'boolean' || obj.common.role.indexOf('switch') !== -1) {
        value = !!value;

        adapter.log.debug('Control "' + obj._id + '"(' + obj.common.name + ') with ' + value);

        adapter.setForeignState(obj._id, value, function (err) {
            if (err) adapter.log.error(err);
            if (cb) cb(err);
        });
    } else
    // control level
    if (obj.common.type === 'number' || obj.common.role.indexOf('level') !== -1) {
        if (value === true) {
            value = obj.common.max !== undefined ? obj.common.max : 100;
        } else
        if (value === false) {
            value = obj.common.min !== undefined ? obj.common.min : 0;
        }

        adapter.log.debug('Control "' + obj._id + '"(' + obj.common.name + ') with ' + value);

        adapter.setForeignState(obj._id, value, function (err) {
            if (err) adapter.log.error(err);
            if (cb) cb(err);
        });
    } else {
        adapter.log.warn('Control of "' + obj._id + '" cannot by done, while type "' + obj.common.type + '" does not supported');
        if (cb) cb('invalid type');
    }
}

function controlDevice(id, value, cb) {
    adapter.getForeignObject(id, function (err, obj) {
        if (err) adapter.log.error(err);
        if (obj && obj.common && obj.common.role) {
            if (obj.common.role.indexOf('switch') === -1 &&
                obj.common.role.indexOf('state')  === -1 &&
                obj.common.role.indexOf('level')  === -1 &&
                obj.common.role.indexOf('blind')  === -1) {
                return cb('nothing to control')
            }
            if (obj.type !== 'state') {
                // try to find children
                adapter.getForeignObjects(id + '.*', function (err, list) {
                    if (err) adapter.log.warn(err);
                    if (list) {
                        for (var id in list) {
                            if (list[id].type === 'state' && list[id].common.write !== false &&
                                (list[id].common.role === 'switch' ||
                                 list[id].common.role === 'state' ||
                                 list[id].common.role === 'level' ||
                                 list[id].common.role === 'level.dimmer' ||
                                 list[id].common.role === 'level.blind')
                            ){
                                controlState(list[id], value, cb);
                                return;
                            }
                        }
                        for (var id in list) {
                            if (list[id].type === 'state' && list[id].common.write !== false &&
                                (list[id].common.role.indexOf('switch') !== -1 ||
                                 list[id].common.role.indexOf('state')  !== -1 ||
                                 list[id].common.role.indexOf('level')  !== -1)
                            ){
                                controlState(list[id], value, cb);
                                return;
                            }
                        }
                    }
                });
            } else {
                controlState(obj, value, cb);
            }

        } else {
            if (!obj) {
                adapter.log.warn('Control of "' + id + '" cannot be done, because object not found');
                if (cb) cb(err || 'object not found');
            } else if (obj.common && !obj.common.role) {
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
    var cmdWords = text.split(' ');
    var valPercent = null;

    if (lang == 'ru') {
        // test operation
        if (cmdWords.indexOf('включить') != -1 || cmdWords.indexOf('включи') != -1 || cmdWords.indexOf('ключи') != -1) {
            valPercent = true;
        }
        else
        if (cmdWords.indexOf('выключи') != -1 || cmdWords.indexOf('выключить') != -1) {
            valPercent = false;
        }
    }
    else if (lang == 'de') {
        // test operation
        if (cmdWords.indexOf('aus') != -1 || cmdWords.indexOf('ausmachen') != -1 || cmdWords.indexOf('ausschalten') != -1) {
            valPercent = false;
        }
        else
        if (cmdWords.indexOf('an') != -1 || cmdWords.indexOf('ein') != -1 || cmdWords.indexOf('einmachen') != -1 || cmdWords.indexOf('einschalten') != -1) {
            valPercent = true;
        }
    }
    else if (lang == 'en') {
        // test operation
        if (cmdWords.indexOf('on') != -1) {
            valPercent = true;
        }
        else
        if (cmdWords.indexOf('off') != -1) {
            valPercent = false;
        }
    }

    return valPercent;
}

function extractBlindCmd(lang, text) {
    var valPercent = null;

    if (lang == 'ru') {
        // test operation
        if (text.indexOf('открыть') != -1 ||
            text.indexOf('подними') != -1 ||
            text.indexOf('открой')  != -1 ||
            text.indexOf('открою')  != -1 ||
            text.indexOf('поднять') != -1) {
            valPercent = 100;
        } else
        if (text.indexOf('закрыть')  != -1 ||
            text.indexOf('закрой')   != -1 ||
            text.indexOf('закрою')   != -1 ||
            text.indexOf('опусти')   != -1 ||
            text.indexOf('опустить') != -1) {
            valPercent = 0;
        }
    }
    else if (lang == 'de') {
        // test operation
        if (text.indexOf(' auf') != -1 ||
            text.indexOf('hoch') != -1 ||
            text.indexOf('aufmachen') != -1
        ) {
            valPercent = 100;
        } else
        if (text.indexOf('zumachen') != -1 ||
            text.indexOf(' zu') != -1 ||
            text.indexOf('runter') != -1) {
            valPercent = 0;
        }
    } else
    if (lang == 'en') {
        // test operation
        if (text.indexOf ('open') != -1) {
            valPercent = 100;
        } else
        if (text.indexOf ('close') != -1) {
            valPercent = 0;
        }
    }
    return valPercent
}

function generateAnswerOnOff(lang, sRoom, sFunction, valPercent) {
    var toSay;
    if (lang == 'en') {
        if (valPercent === true) {
            toSay = 'Switch on ';
        } else
        if (valPercent === false) {
            toSay = 'Switch off ';
        } else {
            toSay = 'Set ';
        }
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
        toSay += rooms.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ' to ' + valPercent + ' percent';
        }
    } else
    if (lang == 'de') {
        toSay = (valPercent === true || valPercent === false) ? 'Schalte ' : 'Setzte ';
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
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
    if (lang == 'ru') {
        if (valPercent === true) {
            toSay = 'Включаю ';
        } else
        if (valPercent === false) {
            toSay = 'Выключаю ';
        } else {
            toSay = 'Устанавливаю ';
        }
        toSay += functions.functionsAccusative[sFunction][lang] + ' ';
        toSay += rooms.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent != false) {
            var nn = valPercent;
            toSay += ' на ' + valPercent + ' ';
            if (nn > 4 && nn < 21) {
                toSay += 'процентов';
            } else {
                nn = nn % 10;
                if (nn == 1) {
                    toSay += 'процент';
                } else if (nn == 2 || nn == 3 || nn == 4) {
                    toSay += 'процентa';
                } else {
                    toSay += 'процентов';
                }
            }
        }
    }

    return toSay;
}

function generateAnswerBlinds(lang, sRoom, valPercent) {
    var toSay;
    if (lang == 'en') {
        toSay = ((valPercent >= 50) ? 'Open' : 'Close') +
            ' the shutter ' +
            rooms.roomsDative[sRoom][lang] +
            ((valPercent != 0 && valPercent != 100) ? ' on ' + valPercent + ' percent': '');
    } else
    if (lang == 'de') {
        toSay = 'Mache' +
            ' die Rolladen ' +
            rooms.roomsDative[sRoom][lang] +
            ((valPercent != 0 && valPercent != 100) ? ' auf ' + valPercent + ' Prozent': '') +
            ((valPercent >= 50) ? ' auf' : ' zu');
    } else
    if (lang == 'ru') {
        toSay = ((valPercent >= 50) ? 'Открываю' : 'Закрываю') +
            ' окна ' + rooms.roomsDative[sRoom][lang];

        if (valPercent != 0 && valPercent != 1) {
            toSay += ' на ' + valPercent + ' ';
            if (valPercent > 4 && valPercent < 21) {
                toSay += 'процентов';
            } else {
                var nn = valPercent % 10;
                if (nn == 1) {
                    toSay += 'процент';
                } else if (nn == 2 || nn == 3 || nn == 4) {
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
    var defaultRoom = text.match(/\[(.+)\]/);
    if (defaultRoom) {
        text = text.replace(defaultRoom[0], '');
        defaultRoom = defaultRoom[1];
    }

    // try to extract boolean command
    var valPercent  = extractValue(lang, text);

    // find room
    var sRoom = findRoom(text, lang);
    if (!sRoom && defaultRoom) sRoom = findRoom(defaultRoom, lang);

    // find function: e.g "light/dimmer"
    sFunction = sFunction || findFunction(text, lang);

    // Find any number
    var m = text.match(/\b(\d+)\b/);
    if (m) valPercent = parseInt(m[1], 10);

    // Don't know what to do
    if (valPercent === null) return simpleAnswers.sayNothingToDo(lang, text, args, ack, cb);

    var devicesInRoom = null;
    // try to find enum for room
    if (sRoom != 'everywhere') {
        devicesInRoom = getEnum('rooms', sRoom, enums);
        // Unknown room
        if (!devicesInRoom) return simpleAnswers.sayNoSuchRoom(lang, text, args, ack, cb);
    }

    // try to find enum for function
    var devicesInFunction = getEnum('functions', sFunction, enums);
    // Unknown function/role
    if (!devicesInFunction) return simpleAnswers.sayNoSuchFunction(lang, text, args, ack, cb);

    var anyControlled;
    var toSay = ack ? generateAnswer(lang, sRoom, sFunction, valPercent) : null;

    var count = 0;
    if (sRoom === 'everywhere') {
        for (var f = 0; f < devicesInFunction.length; f++) {
            count++;
            controlDevice(devicesInFunction[f], valPercent, function (err) {
                if (!err) anyControlled = true;
                if (!--count) {
                    if (!anyControlled) {
                        simpleAnswers.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
                    } else {
                        cb(toSay);
                    }
                }
            });
        }
    } else {
        // Try to find overlapping of devicesInRoom and devicesInFunction
        for (var r = 0; r < devicesInRoom.length; r++) {
            if (devicesInFunction.indexOf(devicesInRoom[r]) != -1) {
                count++;
                controlDevice(devicesInRoom[r], valPercent, function (err) {
                    if (!err) anyControlled = true;
                    setTimeout(function () {
                        if (!--count) {
                            if (!anyControlled) {
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
    if (!count) simpleAnswers.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
}

function controlByFunction(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, null, extractOnOff, generateAnswerOnOff);
}

function controlBlinds(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, 'blind', extractBlindCmd, generateAnswerBlinds);
}

function init(_enums, _adapter) {
    enums = _enums;
    if (_adapter) adapter = _adapter;
}

module.exports = {
    controlBlinds:      controlBlinds,
    controlByFunction:  controlByFunction,
    init:               init
};
