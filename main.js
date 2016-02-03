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
var adapter = utils.adapter({
    name:           'text2command',
    systemConfig:   true
});
var model   = reuqire(__dirname + '/lib/langModel');
var rules;
var commandsCallbacks;

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
    if (!text) return;


}

function processText(cmd, cb) {

    adapter.log.info('processText: "' + cmd + '"');

    var isNothingFound  = true;
    var withLang        = false;
    var ix              = cmd.indexOf (";");
    var lang            = adapter.config.language || (adapter.systemConfig.common ? adapter.systemConfig.common.language : 'en');

    cmd = cmd.toLowerCase();

    if (ix != -1) {
        withLang    = true;
        lang        = cmd.substring(0, ix);
        cmd         = cmd.substring(ix + 1);
    }
    var cmdWords = cmd.split(' ');

    var matchedRules = [];

    for (var r = 0; r < rules.length; r++) {
        var rule    = adapter.settings.rules[i];
        var isFound = true;

        // split rule words one time
        if (typeof rule.words === 'string') {
            // if regex
            if (rule.words[0] === '/') {
                rule.words = new RegExp(rule.words, 'i');
            } else {
                rule.words = rule.words.split(' ');
            }
        }

        // if regexp
        if (rule.words instanceof RegExp) {
            isFound = rule.words.test(cmd);
        } else {
            // compare every word
            for (var j = 0; j < rule.words.length; j++) {

                if (rule.words[j].indexOf ('/') != -1) rule.words[j] = rule.words[j].split('/');

                // if one of
                if (typeof rule.words[j] === 'object') {
                    var _isFound = false;

                    for (var u = 0; u < rule.words[j].length; u++) {
                        if (cmdWords.indexOf(rule.words[j][u]) != -1) {
                            _isFound = true;
                            break;
                        }
                    }

                    if (!_isFound){
                        isFound = false;
                        break;
                    }
                }
                else
                if (cmdWords.indexOf(rule.words[j]) === -1) {
                    isFound = false;
                    break;
                }
            }
        }

        if (isFound) {
            isNothingFound = false;
            adapter.log.info('Found: ' + rule.template);
            matchedRules.push(r);
            if (rule._break) break;
        }
    }

    var result = '';
    var count = matchedRules.length;
    for (var m = 0; m < matchedRules.length; m++) {
        if (commandsCallbacks[rule.template]) {
            commandsCallbacks[rule.template](lang, cmd, rules[matchedRules[m]].args, rules[matchedRules[m]].ack, function (response) {
                // somehow combine answers
                result += (result ? ', ' : '') + response;
                if (!--count) cb((withLang ? lang + ';' : '') + result);
            });
        }
        else {
            count--;
            if (rule.ack) {
                result += (result ? ', ' : '') + model.getRandomPhrase(rules[matchedRules[m]].ack);
            } else {
                adapter.log.warn('No callback for ' + rule.name);
            }
        }
    }

    if (!matchedRules.length) {
        model.sayIDontUnderstand(lang, cmd, null, null, function (result) {
            cb((withLang ? lang + ';' : '') + result);
        });
    } else if (!count) {
        cb((withLang ? lang + ';' : '') + result);
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

function sayOutsideTemperature (lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return model.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.getState(args[0], function (err, state) {
        if (!state || state.val === null || state.val === undefined) {
            return model.sayIDontKnow(lang, text, args, ack, cb);
        }

        var t  = state.val.toString().replace('&deg;', '').replace(',', '.');
        var t_ = parseFloat(t);
        t_ = Math.round(t_);

        if (lang == 'ru') {
            var tr = t % 10;
            if (tr == 1) {
                cb(' Темература на улице один градус');
            }
            else
            if (tr >= 2 && tr <= 4) {
                cb(' Темература на улице ' + t_ + ' градуса');
            }
            else {
                cb(' Темература на улице ' + t_ + ' градусов');
            }
        }
        else if (lang == 'de') {
            cb(' Temperature draußen ist ' + t_ + ' grad');
        }
        else if (lang == 'en') {
            cb(' Outside temperature is ' + t_ + ' degree');
        }
        else {
            adapter.log.error('Language ' + lang + ' is not supported');
            cb();
        }
    });
}

function main() {
    rules = adapter.config.rules || {};
    commandsCallbacks = {
        whatTimeIsIt:       sayTime,
        whatIsYourName:     sayName,
        outsideTemperature: sayOutsideTemperature,
        insideTemperature:  sayInsideTemperature,
        roleOnOff:          controlRole,
        blindsUpDown:       controlBlinds,
        userDeviceControl:  userDeviceControl,
        openLock:           openLock,
        userQuery:          userQuery
    };

    // do nothing, just wait for text2command.X.text
}

