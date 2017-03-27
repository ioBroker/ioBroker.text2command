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
'use strict';

var utils           = require(__dirname + '/lib/utils'); // Get common adapter utils
//noinspection JSUnresolvedFunction
var adapter         = utils.adapter('text2command');
var model           = require(__dirname + '/admin/langModel');
var devicesControl  = require(__dirname + '/lib/devicesControl');
var simpleControl   = require(__dirname + '/lib/simpleControl');
var simpleAnswers   = require(__dirname + '/lib/simpleAnswers');
var functions       = require(__dirname + '/lib/functions');
var rooms           = require(__dirname + '/lib/rooms');

var rules;
var commandsCallbacks;
var systemConfig    = {};
var enums           = {};
var processTimeout  = null;
var processQueue    = [];

adapter.on('stateChange', function (id, state) {
    //noinspection JSUnresolvedVariable
    if (state && !state.ack && state.val) {
        if (id === adapter.namespace + '.text') {
            //noinspection JSUnresolvedVariable
            processText(state.val.toString(), sayIt);
        }
    } else
    //noinspection JSUnresolvedVariable
    if (state && id === adapter.config.processorId && state.ack) {
        // answer received
        if (processTimeout) {
            clearTimeout(processTimeout);
            processTimeout = null;
            var task = processQueue.shift();
            //noinspection JSUnresolvedVariable
            if (state.val) {
                if (task.callback) {
                    //noinspection JSUnresolvedVariable
                    task.callback((task.withLanguage ? task.language + ';' : '') + state.val);
                }
            } else {
                //noinspection JSUnresolvedVariable
                processText((task.withLanguage ? task.language + ';' : '') + task.command, task.callback, null, null, true);
            }
            setTimeout(useExternalProcessor, 0);
        }
    }
});

adapter.on('objectChange', function (id/*, obj*/) {
    if (id.substring(0, 5) === 'enum.') {
        // read all enums
        //noinspection JSUnresolvedFunction
        adapter.getEnums('', function (err, list) {
            enums = list;
            devicesControl.init(enums);
        });
    }
});

adapter.on('ready', function () {
    main();
    //noinspection JSUnresolvedFunction
    adapter.subscribeStates(adapter.namespace + '.text');
});

// New message arrived. obj is array with current messages
adapter.on('message', function (obj) {
    if (obj) {
        //noinspection JSUnresolvedVariable
        switch (obj.command) {
            case 'send':
                if (obj.message) {
                    //noinspection JSUnresolvedVariable
                    processText(typeof obj.message === 'object' ? obj.message.text : obj.message, function (res) {
                        var responseObj = JSON.parse(JSON.stringify(obj.message));
                        if (typeof responseObj !== 'object') responseObj = {text: responseObj};
                        responseObj.response = res;

                        if (obj.callback) {
                            //noinspection JSUnresolvedFunction, JSUnresolvedVariable
                            adapter.sendTo(obj.from, obj.command, responseObj, obj.callback);
                        }
                    }, JSON.parse(JSON.stringify(obj.message)), obj.from);
                }
                break;

            default:
                //noinspection JSUnresolvedVariable
                adapter.log.warn('Unknown command: ' + obj.command);
                break;
        }
    }

    return true;
});

function sayIt(text) {
    //noinspection JSUnresolvedFunction
    adapter.setState('response', text || '', function (err) {
        if (err) adapter.log.error(err);
    });

    //noinspection JSUnresolvedVariable
    if (!text || !adapter.config.sayitInstance) return;

    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    adapter.setForeignState(adapter.config.sayitInstance, text, function (err) {
        if (err) adapter.log.error(err);
    });
}

function useExternalProcessor() {
    if (!processTimeout && processQueue.length) {
        var task = processQueue[0];

        // send task to external processor
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        adapter.setForeignState(adapter.config.processorId, JSON.stringify(task));

        // wait x seconds for answer
        //noinspection JSUnresolvedVariable
        processTimeout = setTimeout(function () {
            processTimeout = null;

            // no answer in given period
            var _task = processQueue.shift();

            // process with rules
            //noinspection JSUnresolvedVariable
            processText((_task.withLanguage ? _task.language + ';' : '') + _task.command, _task.callback, null, null, true);

            // process next
            useExternalProcessor();
        }, adapter.config.processorTimeout || 1000);
    }
}

function processText(cmd, cb, messageObj, from, afterProcessor) {
    adapter.log.info('processText: "' + cmd + '"');
    if (cmd === null || cmd === undefined) {
        adapter.log.error('processText: invalid command!');
        //noinspection JSUnresolvedFunction
        simpleAnswers.sayError(systemConfig.language, 'processText: invalid command!', null, null, function (result) {
            cb(result ? ((withLang ? lang + ';' : '') + result) : '');
        });
        return;
    }
    cmd = cmd.toString();
    var originalCmd = cmd;

    var withLang = false;
    var ix       = cmd.indexOf(';');
    var lang;

    cmd = cmd.toLowerCase();

    // extract language
    if (ix != -1) {
        withLang    = true;
        lang        = cmd.substring(0, ix);
        cmd         = cmd.substring(ix + 1);
        originalCmd = originalCmd.substring(ix + 1);
    }
    lang = lang || adapter.config.language || systemConfig.language || 'en';

    // if desired processing by javascript
    //noinspection JSUnresolvedVariable
    if (!afterProcessor && adapter.config.processorId) {
        var task = messageObj || {};

        task.language =       lang;
        task.command =        originalCmd;
        task.withLanguage =   withLang;
        task.from =           from;
        task.callback =       cb;

        if (processQueue.length < 100) {
            processQueue.push(task);
            useExternalProcessor();
            return;
        } else {
            adapter.log.error('External process queue is full. Try to use rules.');
        }
    } else if (afterProcessor) {
        //noinspection JSUnresolvedVariable
        adapter.log.warn('Timeout for external processor: ' + adapter.config.processorId);
    }

    //noinspection JSUnresolvedFunction
    var matchedRules = model.findMatched(cmd, rules);

    var result = '';
    var count = matchedRules.length;
    for (var m = 0; m < matchedRules.length; m++) {

        //noinspection JSUnresolvedVariable
        if (model.commands[rules[matchedRules[m]].template] && model.commands[rules[matchedRules[m]].template].extractText) {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            cmd = simpleControl.extractText(cmd, originalCmd, rules[matchedRules[m]].words);
        }

        //noinspection JSUnresolvedVariable
        if (commandsCallbacks[rules[matchedRules[m]].template]) {
            //noinspection JSUnresolvedVariable
            commandsCallbacks[rules[matchedRules[m]].template](lang, cmd, rules[matchedRules[m]].args, rules[matchedRules[m]].ack, function (response) {
                adapter.log.info('Response: ' + response);

                // somehow combine answers
                if (response) {
                    //noinspection JSReferencingMutableVariableFromClosure
                    result += (result ? ', ' : '') + response;
                }

                if (!--count) {
                    if (cb) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        cb(result ? ((withLang ? lang + ';' : '') + result) : '');
                    }
                    cb = null;
                }
            });
        }
        else {
            count--;
            if (rules[matchedRules[m]].ack) {
                //noinspection JSUnresolvedFunction
                result += (result ? ', ' : '') + simpleAnswers.getRandomPhrase(rules[matchedRules[m]].ack);
            }
        }
    }

    if (!matchedRules.length) {
        //noinspection JSUnresolvedFunction
        simpleAnswers.sayIDontUnderstand(lang, cmd, null, null, function (result) {
            if (cb) cb(result ? ((withLang ? lang + ';' : '') + result) : '');
            cb = null;
        });
    } else if (!count) {
        if (cb) cb(result ? ((withLang ? lang + ';' : '') + result) : '');
        cb = null;
    }
}

function main() {
    rules = adapter.config.rules || {};
    //noinspection JSUnresolvedVariable
    commandsCallbacks = {
        whatTimeIsIt:       simpleControl.sayTime,
        whatIsYourName:     simpleControl.sayName,
        outsideTemperature: simpleControl.sayTemperature,
        insideTemperature:  simpleControl.sayTemperature,
        functionOnOff:      devicesControl.controlByFunction,
        blindsUpDown:       devicesControl.controlBlinds,
        userDeviceControl:  simpleControl.userDeviceControl,
        sendText:           simpleControl.sendText,
/*        openLock:           openLock,*/
        userQuery:          simpleControl.userQuery
    };

    //noinspection JSUnresolvedFunction
    adapter.subscribeForeignObjects('enum.*');
    //noinspection JSUnresolvedVariable
    if (adapter.config.processorId) {
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        adapter.subscribeForeignStates(adapter.config.processorId);
    }

    // read system configuration
    //noinspection JSUnresolvedFunction
    adapter.getForeignObject('system.config', function (err, obj) {
        //noinspection JSUnresolvedVariable
        systemConfig = (obj ? obj.common : {}) || {};
        simpleControl.init(systemConfig, adapter);
    });


    // read all enums
    //noinspection JSUnresolvedFunction
    adapter.getEnums('', function (err, list) {
        enums = list;
        devicesControl.init(enums, adapter);
    });
}

