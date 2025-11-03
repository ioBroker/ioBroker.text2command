// structure of rule
// {
//     template: 'templateName'
//     words: 'key words option1/option2/option3 option* option_'
//     args: []
//     ack: true/false (If acknowledge must be written into .text back
//     _break: true  // if break processing rules if match
//
//

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const adapterName = require('./package.json').name.split('.').pop();
//noinspection JSUnresolvedFunction
const model = require('./admin/langModel');
const devicesControl = require('./lib/devicesControl');
const simpleControl = require('./lib/simpleControl');
const simpleAnswers = require('./lib/simpleAnswers');

let rules;
let commandsCallbacks;
let systemConfig = {};
let enums = {};
let processTimeout = null;
let processQueue = [];

let adapter;

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {
        name: adapterName,
    });

    adapter = new utils.Adapter(options);

    adapter.on('stateChange', (id, state) => {
        //noinspection JSUnresolvedVariable
        if (state && !state.ack && state.val && id === adapter.namespace + '.text') {
            //noinspection JSUnresolvedVariable
            processText(state.val.toString(), sayIt);
        } else if (state && id === adapter.config.processorId && state.ack) {
            //noinspection JSUnresolvedVariable
            // answer received
            if (processTimeout) {
                clearTimeout(processTimeout);
                processTimeout = null;
                let task = processQueue.shift();
                //noinspection JSUnresolvedVariable
                if (state.val || state.val === '' || state.val === 0) {
                    if (task.callback) {
                        // noinspection JSUnresolvedVariable
                        task.callback((task.withLanguage ? `${task.language};` : '') + state.val);
                    }
                } else {
                    // noinspection JSUnresolvedVariable
                    processText(
                        (task.withLanguage ? `${task.language};` : '') + task.command,
                        task.callback,
                        null,
                        null,
                        true,
                    );
                }
                setImmediate(useExternalProcessor);
            }
        }
    });

    adapter.on('objectChange', (id /*, obj*/) => {
        if (id.substring(0, 5) === 'enum.') {
            // read all enums
            //noinspection JSUnresolvedFunction
            adapter.getEnums('', (err, list) => {
                enums = list;
                devicesControl.init(enums);
            });
        }
    });

    adapter.on('ready', () => {
        main()
            //noinspection JSUnresolvedFunction
            .then(() => adapter.subscribeStates(adapter.namespace + '.text'));
    });

    // New message arrived. obj is array with current messages
    adapter.on('message', obj => {
        if (obj) {
            //noinspection JSUnresolvedVariable
            switch (obj.command) {
                case 'send':
                    if (obj.message) {
                        //noinspection JSUnresolvedVariable
                        processText(
                            typeof obj.message === 'object' ? obj.message.text : obj.message,
                            res => {
                                let responseObj = JSON.parse(JSON.stringify(obj.message));
                                if (typeof responseObj !== 'object') {
                                    responseObj = { text: responseObj };
                                }

                                responseObj.response = res;

                                if (obj.callback) {
                                    //noinspection JSUnresolvedFunction, JSUnresolvedVariable
                                    adapter.sendTo(obj.from, obj.command, responseObj, obj.callback);
                                }
                            },
                            typeof obj.message === 'object' ? JSON.parse(JSON.stringify(obj.message)) : null,
                            obj.from,
                        );
                    }
                    break;

                default:
                    //noinspection JSUnresolvedVariable
                    adapter.log.warn(`Unknown command: ${obj.command}`);
                    break;
            }
        }

        adapter.on('unload', callback => {
            if (processTimeout) {
                clearTimeout(processTimeout);
                processTimeout = null;
            }
            callback();
        });

        return true;
    });

    return adapter;
}

function sayIt(text) {
    //noinspection JSUnresolvedFunction
    adapter
        .setStateAsync('response', text || '', true)
        .then(() => {
            if (text && adapter.config.sayitInstance) {
                //noinspection JSUnresolvedVariable
                return adapter.getForeignObjectAsync(adapter.config.sayitInstance).then(obj => {
                    if (obj) {
                        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                        return adapter.setForeignStateAsync(adapter.config.sayitInstance, text);
                    } else {
                        adapter.log.warn(
                            'If you want to use sayit functionality, please install sayit or disable it in settings (Answer in id)',
                        );
                    }
                });
            }
        })
        .catch(err => adapter.log.error(err));
}

function useExternalProcessor() {
    if (!processTimeout && processQueue.length) {
        let task = processQueue[0];

        // send task to external processor
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        adapter.setForeignState(adapter.config.processorId, JSON.stringify(task));

        // wait x seconds for answer
        //noinspection JSUnresolvedVariable
        processTimeout = setTimeout(() => {
            processTimeout = null;

            // no answer in given period
            let _task = processQueue.shift();

            // process with rules
            //noinspection JSUnresolvedVariable
            processText(
                (_task.withLanguage ? `${_task.language};` : '') + _task.command,
                _task.callback,
                null,
                null,
                true,
            );

            // process next
            useExternalProcessor();
        }, adapter.config.processorTimeout || 1000);
    }
}

function processText(cmd, cb, messageObj, from, afterProcessor) {
    adapter.log.info(`processText: "${cmd}"`);

    let lang = adapter.config.language || systemConfig.language || 'en';
    if (cmd === null || cmd === undefined) {
        adapter.log.error('processText: invalid command!');
        adapter.setState('error', 'invalid command', true);
        //noinspection JSUnresolvedFunction
        return simpleAnswers.sayError(lang, 'processText: invalid command!', null, null, result =>
            cb(result ? (withLang ? `${lang};` : '') + result : ''),
        );
    }

    cmd = cmd.toString();
    let originalCmd = cmd;

    let withLang = false;
    let ix = cmd.indexOf(';');

    cmd = cmd.toLowerCase();

    // extract language
    if (ix !== -1) {
        withLang = true;
        lang = cmd.substring(0, ix) || lang;
        cmd = cmd.substring(ix + 1);
        originalCmd = originalCmd.substring(ix + 1);
    }

    // if desired processing by javascript
    //noinspection JSUnresolvedVariable
    if (!afterProcessor && adapter.config.processorId) {
        let task = messageObj || {};

        task.language = lang;
        task.command = originalCmd;
        task.withLanguage = withLang;
        task.from = from;
        task.callback = cb;

        if (processQueue.length < 100) {
            processQueue.push(task);
            return useExternalProcessor();
        } else {
            adapter.log.error('External process queue is full. Try to use rules.');
        }
    } else if (afterProcessor) {
        // noinspection JSUnresolvedVariable
        adapter.log.warn(`Timeout for external processor: ${adapter.config.processorId}`);
    }

    // noinspection JSUnresolvedFunction
    let matchedRules = model.findMatched(cmd, rules);

    let result = '';
    let count = matchedRules.length;

    for (let m = 0; m < matchedRules.length; m++) {
        //noinspection JSUnresolvedVariable
        if (
            model.commands[rules[matchedRules[m]].template] &&
            model.commands[rules[matchedRules[m]].template].extractText
        ) {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            cmd = simpleControl.extractText(cmd, originalCmd, rules[matchedRules[m]].words);
        }

        //noinspection JSUnresolvedVariable
        if (commandsCallbacks[rules[matchedRules[m]].template]) {
            //noinspection JSUnresolvedVariable
            commandsCallbacks[rules[matchedRules[m]].template](
                lang,
                cmd,
                rules[matchedRules[m]].args,
                rules[matchedRules[m]].ack,
                response => {
                    adapter.log.info(`Response: ${response}`);

                    // somehow combine answers
                    if (response) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        result += (result ? ', ' : '') + response;
                    }

                    adapter.config.writeEveryAnswer && adapter.setState('response', response, true);

                    if (!--count) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        cb && cb(result ? (withLang ? `${lang};` : '') + result : '');
                        cb = null;
                    }
                },
            );
        } else {
            count--;
            if (rules[matchedRules[m]].ack) {
                //noinspection JSUnresolvedFunction
                result += (result ? ', ' : '') + simpleAnswers.getRandomPhrase(rules[matchedRules[m]].ack);
            }
        }
    }

    if (!matchedRules.length) {
        //noinspection JSUnresolvedFunction
        if (!adapter.config.noNegativeMessage) {
            simpleAnswers.sayIDontUnderstand(lang, cmd, null, null, result => {
                cb && cb(result ? (withLang ? `${lang};` : '') + result : '');
                cb = null;
            });
        } else {
            cb && cb('');
            cb = null;
        }
    } else if (!count) {
        cb && cb(result ? (withLang ? `${lang};` : '') + result : '');
        cb = null;
    }
}

async function main() {
    rules = adapter.config.rules || {};
    //noinspection JSUnresolvedVariable
    commandsCallbacks = {
        whatTimeIsIt: simpleControl.sayTime,
        whatIsYourName: simpleControl.sayName,
        outsideTemperature: simpleControl.sayTemperature,
        insideTemperature: simpleControl.sayTemperature,
        functionOnOff: devicesControl.controlByFunction,
        blindsUpDown: devicesControl.controlBlinds,
        userDeviceControl: simpleControl.userDeviceControl,
        sendText: simpleControl.sendText,
        /*        openLock:           openLock,*/
        userQuery: simpleControl.userQuery,
        buildAnswer: simpleControl.buildAnswer,
    };

    // read system configuration
    //noinspection JSUnresolvedFunction
    const obj = await adapter.getForeignObjectAsync('system.config');
    //noinspection JSUnresolvedVariable
    systemConfig = (obj ? obj.common : {}) || {};
    simpleControl.init(systemConfig, adapter);

    // read all enums
    //noinspection JSUnresolvedFunction
    const enums = await adapter.getEnumsAsync('');
    devicesControl.init(enums, adapter);

    //noinspection JSUnresolvedFunction
    await adapter.subscribeForeignObjectsAsync('enum.*');
    //noinspection JSUnresolvedVariable
    if (adapter.config.processorId) {
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        await adapter.subscribeForeignStatesAsync(adapter.config.processorId);
    }
}

// If started as allInOne mode => return function to create instance
if (module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
