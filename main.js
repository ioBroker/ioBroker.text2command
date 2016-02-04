// structure of rule
// {
//     template: 'templateName'
//     words: 'key words option1/option2/option3 option* option_'
//     args: []
//     ack: true/false (If acknowledge must be written into .text back
//     _break: true  // if break processing rules if match
//
//

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils   = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('text2command');
var model   = require(__dirname + '/admin/langModel');
var rules;
var commandsCallbacks;
var systemConfig = {};
var enums        = {};

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack && state.val) {
        if (id == adapter.namespace + '.text') {
            processText(state.val.toString(), sayIt);
        }
    }
});

adapter.on('objectChange', function (id, obj) {
    if (id.substring(0, 5) === 'enum.') {
        // read all enums
        adapter.getEnums('', function (err, list) {
            enums = list;
        });
    }
});

adapter.on('ready', function () {
    main();
    adapter.subscribeStates(adapter.namespace + '.text');
});

// New message arrived. obj is array with current messages
adapter.on('message', function (obj) {
    if (obj) {
        switch (obj.command) {
            case 'send':
                if (obj.message) {
                    processText(obj.message, function (res) {
                        if (obj.callback) adapter.sendTo(obj.from, obj.command, res, obj.callback);
                    });
                }
                break;

            default:
                adapter.log.warn('Unknown command: ' + obj.command);
                break;
        }
    }

    return true;
});

function sayIt(text) {
    adapter.setState('response', text || '', function (err) {
        if (err) adapter.log.error(err);
    });

    if (!text || !adapter.config.sayitInstance) return;

    adapter.setForeignState(adapter.config.sayitInstance, text, function (err) {
        if (err) adapter.log.error(err);
    });
}

function processText(cmd, cb) {
    adapter.log.info('processText: "' + cmd + '"');
    var withLang = false;
    var ix       = cmd.indexOf(';');
    var lang;

    cmd = cmd.toLowerCase();

    // extract language
    if (ix != -1) {
        withLang = true;
        lang     = cmd.substring(0, ix);
        cmd      = cmd.substring(ix + 1);
    }
    lang = lang || adapter.config.language || systemConfig.language || 'en';

    var matchedRules = model.findMatched(cmd, rules);

    var result = '';
    var count = matchedRules.length;
    for (var m = 0; m < matchedRules.length; m++) {
        if (commandsCallbacks[rules[matchedRules[m]].template]) {
            commandsCallbacks[rules[matchedRules[m]].template](lang, cmd, rules[matchedRules[m]].args, rules[matchedRules[m]].ack, function (response) {
                // somehow combine answers
                if (response) {
                    result += (result ? ', ' : '') + response;
                }

                if (!--count) cb(result ? ((withLang ? lang + ';' : '') + result) : '');
            });
        }
        else {
            count--;
            if (rules[matchedRules[m]].ack) {
                result += (result ? ', ' : '') + model.getRandomPhrase(rules[matchedRules[m]].ack);
            } else {
                adapter.log.warn('No callback for ' + rule.name);
            }
        }
    }

    if (!matchedRules.length) {
        model.sayIDontUnderstand(lang, cmd, null, null, function (result) {
            cb(result ? ((withLang ? lang + ';' : '') + result) : '');
        });
    } else if (!count) {
        cb(result ? ((withLang ? lang + ';' : '') + result) : '');
    }
}

function sayTime(lang, text, args, ack, cb) {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    if (h < 10) h = '0' + '' + h;
    if (m < 10) m = '0' + '' + m;

    cb(h + ':' + m);
}

function sayName(lang, text, args, ack, cb) {
    if (ack) {
        cb(model.getRandomPhrase(ack));
    } else {
        model.sayNoName(lang, text, args, ack, cb);
    }
}

function sayTemperature(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return model.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.getForeignObject(args[0], function (err, obj) {
        if (!obj) {
            return model.sayIDontKnow(lang, text, args, ack, cb);
        }

        adapter.getForeignState(args[0], function (err, state) {
            if (!state || state.val === null || state.val === undefined) {
                return model.sayIDontKnow(lang, text, args, ack, cb);
            }

            // replace , with . | convert to float and round to integer
            var t = Math.round(parseFloat(state.val.toString().replace('&deg;', '').replace(',', '.')));
            var u = (obj.common ? obj.common.units : systemConfig.tempUnit) || systemConfig.tempUnit;
            u = u || '°C';

            if (!ack) {
                if (lang == 'ru') ack = 'Темература %s %u';
                if (lang == 'de') ack = 'Temperature ist %s %u';
                if (lang == 'en') ack = 'Temperature is %s %u';
            }

            if (!ack) {
                adapter.log.error('Language ' + lang + ' is not supported');
                cb();
                return;
            }

            if (u == '°C') {
                if (lang == 'ru') u = ' целсия';
                if (lang == 'de') u = ' Celsius';
                if (lang == 'en') u = ' Celsius';
            } else
            if (u == '°F') {
                if (lang == 'ru') u = ' по фаренгейту';
                if (lang == 'de') u = ' fahrenheit';
                if (lang == 'en') u = ' fahrenheit';
            }

            if (lang == 'ru') {
                // get last digit
                var tr = t % 10;
                if (tr == 1) {
                    cb(ack.replace('%s', t).replace('один', 'градус ' + u));
                }
                else
                if (tr >= 2 && tr <= 4) {
                    cb(ack.replace('%s', t).replace(t, 'градуса ' + u));
                }
                else {
                    cb(ack.replace('%s', t).replace(t, 'градусов ' + u));
                }
            }
            else if (lang == 'de') {
                cb(ack.replace('%s', t).replace('%u', 'grad ' + u));
            }
            else if (lang == 'en') {
                if (t == 1) {
                    cb(ack.replace('%s', t).replace('%u', 'degree ' + u));
                } else {
                    cb(ack.replace('%s', t).replace('%u', 'degrees ' + u));
                }
            }
            else {
                adapter.log.error('Language ' + lang + ' is not supported');
                cb();
            }
        });
    });
}

function userDeviceControl(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return model.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Control ID ' + args[0] + ' with : ' + args[1]);

    if (typeof args[1] === 'string') {
        // try to parse "{val: 5, ack: true}"
        if (args[1][0] === '{') {
            try {
                args[1] = JSON.parse(args[1]);
            } catch (e) {
                // ignore it
            }
        }
        if (typeof args[1] === 'string') {
            if (args[1] === 'true')  args[1] = true;
            if (args[1] === 'false') args[1] = false;
            var f = parseFloat(args[1]);
            if (f.toString() == args[1]) args[1] = f;
        }
    }

    adapter.setForeignState(args[0], args[1], function (err) {
        if (err) {
            adapter.log.error(err);
            model.sayError(lang, err, args, ack, cb);
        } else if (ack) {
            cb(model.getRandomPhrase(ack));
        } else {
            cb();
        }
    });
}

function userQuery(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return model.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Say ID ' + args[0]);

    adapter.getForeignState(args[0], function (err, state) {
        if (err) {
            adapter.log.error(err);
            model.sayError(lang, err, args, ack, cb);
        } else {
            if (!state || state.val === null || state.val === undefined) {
                return model.sayIDontKnow(lang, text, args, ack, cb);
            }

            if (state.val === 'true' || state.val === true) {
                if (lang == 'ru') state.val = ' да';
                if (lang == 'de') state.val = ' ja';
                if (lang == 'en') state.val = ' yes';
            }
            if (state.val === 'false' || state.val === false) {
                if (lang == 'ru') state.val = ' нет';
                if (lang == 'de') state.val = ' nein';
                if (lang == 'en') state.val = ' no';
            }
            cb(model.getRandomPhrase(ack).replace('%s', state.val.toString()));
        }
    });
}

function findRoom(text, lang) {
    var sRoom = '';
    for (var room in model.rooms) {
        var words = model.rooms[room][lang].split('/');
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
    for (var _f in model.functions) {
        var words = model.functions[_f][lang].split('/');
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

function getEnum(enumType, text, lang) {
    enumType = 'enum.' + enumType;
    if (!enums[enumType]) {
        adapter.log.warn('No enum "' + enumType + '" found.');
        return null;
    }
    text = text.split('/');
    for (var t = 0; t < text.length; t++) {
        if (enums[enumType][enumType + '.' + text[t]]) {
            return enums[enumType][enumType + '.' + text[t]];
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

function controlDevice(id, value, cb) {
    adapter.getForeignObject(id, function (err, obj) {
        if (err) adapter.log.error(err);
        if (obj && obj.common && obj.common.role) {
            if (obj.common.role.indexOf('switch') === -1 &&
                obj.common.role.indexOf('state')  === -1 &&
                obj.common.role.indexOf('level')  === -1) {
                return cb('nothing to control')
            }

            if (obj.common.write === false) return cb('cannot control');


            // control switch
            if (obj.common.type === 'boolean' || obj.common.role.indexOf('switch') !== -1) {
                value = !!value;

                adapter.log.debug('Control "' + id + '"(' + obj.common.name + ') with ' + value);

                adapter.setForeignState(id, value, function (err) {
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

                adapter.log.debug('Control "' + id + '"(' + obj.common.name + ') with ' + value);

                adapter.setForeignState(id, value, function (err) {
                    if (err) adapter.log.error(err);
                    if (cb) cb(err);
                });
            } else {
                adapter.log.warn('Control of "' + id + '" cannot by done, while type "' + obj.common.type + '" does not supported');
                if (cb) cb(err || 'invalid type');
            }
        } else {
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
    else {
        adapter.error('Language ' + lang + ' is not supported');
        return;
    }
    return valPercent;
}

function extractBlindCmd(lang, text) {
    var cmdWords = text.split(' ');
    var valPercent = null;

    if (lang == 'ru') {
        // test operation
        if (text.indexOf('открыть') != -1 ||
            text.indexOf('подними') != -1 ||
            text.indexOf("открой") != -1 ||
            text.indexOf("открою") != -1 ||
            text.indexOf("поднять") != -1) {
            valPercent = 100;
        } else
        if (text.indexOf('закрыть') != -1 ||
            text.indexOf('закрой') != -1 ||
            text.indexOf("закрою") != -1 ||
            text.indexOf("опусти") != -1 ||
            text.indexOf("опустить") != -1) {
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
    } else {
        adapter.error('Language ' + lang + ' is not supported');
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
        toSay += model.functionsAccusative[sFunction][lang] + ' ';
        toSay += model.roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ' to ' + valPercent + ' percent';
        }
    } else
    if (lang == 'de') {
        toSay = (valPercent === true || valPercent === false) ? 'Schalte ' : 'Setzte ';
        toSay += model.functionsAccusative[sFunction][lang] + ' ';
        toSay += model.roomsDative[sRoom][lang];
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
        toSay += model.functionsAccusative[sFunction][lang] + ' ';
        toSay += model.roomsDative[sRoom][lang];
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
            model.roomsDative[sRoom][lang] +
            ((valPercent != 0 && valPercent != 100) ? ' on ' + valPercent + ' percent': '');
    } else
    if (lang == 'de') {
        toSay = 'Mache' +
            ' die Rolladen ' +
            model.roomsDative[sRoom][lang] +
            ((valPercent != 0 && valPercent != 100) ? ' auf ' + valPercent + ' Prozent': '') +
            ((valPercent >= 50) ? ' auf' : ' zu');
    } else
    if (lang == 'ru') {
        toSay = ((valPercent >= 50) ? 'Открываю' : 'Закрываю') +
            ' окна ' + model.roomsDative[sRoom][lang];

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
    if (!sRoom) sRoom = findRoom(defaultRoom, lang);

    // find function: e.g "light/dimmer"
    sFunction = sFunction || findFunction(text, lang);

    // Find any number
    var m = text.match(/\b(\d+)\b/);
    if (m) valPercent = parseInt(m[1], 10);

    // Don't know what to do
    if (valPercent === null) return model.sayNothingToDo(lang, text, args, ack, cb);

    var devicesInRoom = null;
    // try to find enum for room
    if (sRoom != 'everywhere') {
        devicesInRoom = getEnum('rooms', sRoom, lang);
        // Unknown room
        if (!devicesInRoom) return model.sayNoSuchRoom(lang, text, args, ack, cb);
    }

    // try to find enum for function
    var devicesInFunction = getEnum('functions', sFunction, lang);
    // Unknown function/role
    if (!devicesInFunction) return model.sayNoSuchFunction(lang, text, args, ack, cb);

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
                        model.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
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
                    if (!--count) {
                        if (!anyControlled) {
                            model.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
                        } else {
                            cb(toSay);
                        }
                    }
                });
            }
        }
    }

    // You don't have this function in this room
    if (!count) model.sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
}

function controlByFunction(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, null, extractOnOff, generateAnswerOnOff);
}

function controlBlinds(lang, text, args, ack, cb) {
    return controlByFunctionHelper(lang, text, args, ack, cb, 'blind', extractBlindCmd, generateAnswerBlinds);
}

function main() {
    rules = adapter.config.rules || {};
    commandsCallbacks = {
        whatTimeIsIt:       sayTime,
        whatIsYourName:     sayName,
        outsideTemperature: sayTemperature,
        insideTemperature:  sayTemperature,
        functionOnOff:      controlByFunction,
        blindsUpDown:       controlBlinds,
        userDeviceControl:  userDeviceControl,
/*        openLock:           openLock,*/
        userQuery:          userQuery
    };

    adapter.subscribeForeignObjects('enum.*');

    // read system configuration
    adapter.getForeignObject('system.config', function (err, obj) {
        systemConfig = (obj ? obj.common : {}) || {};
    });

    // read all enums
    adapter.getEnums('', function (err, list) {
        enums = list;
    });
}

