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

var utils           = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter         = utils.adapter('text2command');
var model           = require(__dirname + '/admin/langModel');
var devicesControl  = require(__dirname + '/lib/devicesControl');
var simpleControl   = require(__dirname + '/lib/simpleControl');
var simpleAnswers   = require(__dirname + '/lib/simpleAnswers');
var functions       = require(__dirname + '/lib/functions');
var rooms           = require(__dirname + '/lib/rooms');



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
            devicesControl.init(enums);
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
                result += (result ? ', ' : '') + simpleAnswers.getRandomPhrase(rules[matchedRules[m]].ack);
            } else {
                adapter.log.warn('No callback for ' + rule.name);
            }
        }
    }

    if (!matchedRules.length) {
        simpleAnswers.sayIDontUnderstand(lang, cmd, null, null, function (result) {
            cb(result ? ((withLang ? lang + ';' : '') + result) : '');
        });
    } else if (!count) {
        cb(result ? ((withLang ? lang + ';' : '') + result) : '');
    }
}

function main() {
    rules = adapter.config.rules || {};
    commandsCallbacks = {
        whatTimeIsIt:       simpleControl.sayTime,
        whatIsYourName:     simpleControl.sayName,
        outsideTemperature: simpleControl.sayTemperature,
        insideTemperature:  simpleControl.sayTemperature,
        functionOnOff:      devicesControl.controlByFunction,
        blindsUpDown:       devicesControl.controlBlinds,
        userDeviceControl:  simpleControl.userDeviceControl,
/*        openLock:           openLock,*/
        userQuery:          simpleControl.userQuery
    };

    adapter.subscribeForeignObjects('enum.*');

    // read system configuration
    adapter.getForeignObject('system.config', function (err, obj) {
        systemConfig = (obj ? obj.common : {}) || {};
        simpleControl.init(adapter, systemConfig);
    });


    // read all enums
    adapter.getEnums('', function (err, list) {
        enums = list;
        devicesControl.init(enums, adapter);
        require('fs').writeFileSync('testData.json', JSON.stringify(enums, null, 2));
    });
}

