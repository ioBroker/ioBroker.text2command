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

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack && state.val) {
        if (id == adapter.namespace + '.text') {
            processText(state.val.toString(), sayIt);
        }
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

function main() {
    rules = adapter.config.rules || {};
    commandsCallbacks = {
        whatTimeIsIt:       sayTime,
        whatIsYourName:     sayName,
        outsideTemperature: sayTemperature,
        insideTemperature:  sayTemperature,
        /*roleOnOff:          controlRole,
        blindsUpDown:       controlBlinds,*/
        userDeviceControl:  userDeviceControl,
/*        openLock:           openLock,*/
        userQuery:          userQuery
    };

    // read system configuration
    adapter.getForeignObject('system.config', function (err, obj) {
        systemConfig = (obj ? obj.common : {}) || {};
    });
}

