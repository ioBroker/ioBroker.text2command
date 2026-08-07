// structure of rule
// {
//     template: 'templateName'
//     words: 'key words option1/option2/option3 option* option_'
//     args: []
//     ack: true/false (If acknowledge must be written into .text back
//     _break: true  // if break processing rules if match
// }

import * as utils from '@iobroker/adapter-core'; // Get common adapter utils
import { commands, findMatched } from './lib/langModel';
import { controlBlinds, controlByFunction, init as initDevicesControl, type Enums } from './lib/devicesControl';
import {
    buildAnswer,
    extractText,
    init as initSimpleControl,
    sayName,
    sayTemperature,
    sayTime,
    sendText,
    userDeviceControl,
    userQuery,
} from './lib/simpleControl';
import { getRandomPhrase, sayError, sayIDontUnderstand } from './lib/simpleAnswers';
import type { AnswerCallback, CommandCallback, ProcessorTask, Text2CommandRule } from './lib/types';

const adapterName: string = (require('../package.json') as { name: string }).name.split('.').pop()!;

let rules: Text2CommandRule[] = [];
let commandsCallbacks: Record<string, CommandCallback> = {};
let systemConfig: Partial<ioBroker.SystemConfigCommon> = {};
let enums: Enums = {};
let processTimeout: NodeJS.Timeout | null = null;
const processQueue: ProcessorTask[] = [];

let adapter: ioBroker.Adapter;

function startAdapter(options?: Partial<utils.AdapterOptions>): ioBroker.Adapter {
    adapter = new utils.Adapter({
        ...(options || {}),
        name: adapterName,
    });

    adapter.on('stateChange', (id, state) => {
        if (state && !state.ack && state.val && id === `${adapter.namespace}.text`) {
            processText(state.val.toString(), sayIt);
        } else if (state && id === adapter.config.processorId && state.ack) {
            // answer received
            if (processTimeout) {
                clearTimeout(processTimeout);
                processTimeout = null;
                const task = processQueue.shift();
                if (task) {
                    if (state.val || state.val === '' || state.val === 0) {
                        task.callback?.((task.withLanguage ? `${task.language};` : '') + String(state.val));
                    } else {
                        processText(
                            (task.withLanguage ? `${task.language};` : '') + task.command,
                            task.callback,
                            null,
                            null,
                            true,
                        );
                    }
                }
                setImmediate(useExternalProcessor);
            }
        }
    });

    adapter.on('objectChange', (id /*, obj*/) => {
        if (id.startsWith('enum.')) {
            // read all enums
            void adapter.getEnums('', (_err, list) => {
                enums = list || {};
                initDevicesControl(enums);
            });
        }
    });

    adapter.on('ready', () => {
        void main().then(() => adapter.subscribeStates(`${adapter.namespace}.text`));
    });

    // New message arrived. obj is array with current messages
    adapter.on('message', obj => {
        if (obj) {
            switch (obj.command) {
                case 'send':
                    if (obj.message) {
                        processText(
                            typeof obj.message === 'object' ? obj.message.text : obj.message,
                            res => {
                                let responseObj = JSON.parse(JSON.stringify(obj.message)) as Record<string, unknown>;
                                if (typeof responseObj !== 'object') {
                                    responseObj = { text: responseObj };
                                }

                                responseObj.response = res;

                                if (obj.callback) {
                                    adapter.sendTo(obj.from, obj.command, responseObj, obj.callback);
                                }
                            },
                            typeof obj.message === 'object'
                                ? (JSON.parse(JSON.stringify(obj.message)) as Record<string, unknown>)
                                : null,
                            obj.from,
                        );
                    }
                    break;

                default:
                    adapter.log.warn(`Unknown command: ${obj.command}`);
                    break;
            }
        }
    });

    adapter.on('unload', callback => {
        if (processTimeout) {
            clearTimeout(processTimeout);
            processTimeout = null;
        }
        callback();
    });

    return adapter;
}

function sayIt(text?: string | null): void {
    adapter
        .setStateAsync('response', text || '', true)
        .then(() => {
            if (text && adapter.config.sayitInstance) {
                return adapter.getForeignObjectAsync(adapter.config.sayitInstance).then(obj => {
                    if (obj) {
                        return adapter.setForeignStateAsync(adapter.config.sayitInstance, text);
                    }
                    adapter.log.warn(
                        'If you want to use sayit functionality, please install sayit or disable it in settings (Answer in id)',
                    );
                    return undefined;
                });
            }
            return undefined;
        })
        .catch(err => adapter.log.error(err.toString()));
}

function useExternalProcessor(): void {
    if (!processTimeout && processQueue.length) {
        const task = processQueue[0];

        // send task to external processor
        adapter.setForeignState(adapter.config.processorId, JSON.stringify(task));

        // wait x seconds for answer
        processTimeout = setTimeout(
            () => {
                processTimeout = null;

                // no answer in given period
                const _task = processQueue.shift();

                if (_task) {
                    // process with rules
                    processText(
                        (_task.withLanguage ? `${_task.language};` : '') + _task.command,
                        _task.callback,
                        null,
                        null,
                        true,
                    );
                }

                // process next
                useExternalProcessor();
            },
            Number(adapter.config.processorTimeout) || 1000,
        );
    }
}

function processText(
    cmd: string | null | undefined,
    cb: AnswerCallback | null | undefined,
    messageObj?: Record<string, unknown> | null,
    from?: string | null,
    afterProcessor?: boolean,
): void {
    adapter.log.info(`processText: "${cmd}"`);

    let lang: ioBroker.Languages = adapter.config.language || systemConfig.language || 'en';
    let withLang = false;

    if (cmd === null || cmd === undefined) {
        adapter.log.error('processText: invalid command!');
        void adapter.setState('error', 'invalid command', true);
        sayError(lang, 'processText: invalid command!', null, null, result =>
            cb?.(result ? (withLang ? `${lang};` : '') + result : ''),
        );
        return;
    }

    cmd = cmd.toString();
    let originalCmd = cmd;

    const ix = cmd.indexOf(';');

    cmd = cmd.toLowerCase();

    // extract language
    if (ix !== -1) {
        withLang = true;
        lang = (cmd.substring(0, ix) as ioBroker.Languages) || lang;
        cmd = cmd.substring(ix + 1);
        originalCmd = originalCmd.substring(ix + 1);
    }

    // if desired processing by javascript
    if (!afterProcessor && adapter.config.processorId) {
        const task: ProcessorTask = {
            ...(messageObj || {}),
            language: lang,
            command: originalCmd,
            withLanguage: withLang,
            from: from || undefined,
            callback: cb || undefined,
        };

        if (processQueue.length < 100) {
            processQueue.push(task);
            useExternalProcessor();
            return;
        }
        adapter.log.error('External process queue is full. Try to use rules.');
    } else if (afterProcessor) {
        adapter.log.warn(`Timeout for external processor: ${adapter.config.processorId}`);
    }

    const matchedRules = findMatched(cmd, rules);

    let result = '';
    let count = matchedRules.length;

    for (let m = 0; m < matchedRules.length; m++) {
        const rule = rules[matchedRules[m]];

        if (commands[rule.template]?.extractText) {
            cmd = extractText(cmd, originalCmd, rule.words);
        }

        const commandCallback = commandsCallbacks[rule.template];
        if (commandCallback) {
            commandCallback(lang, cmd, rule.args, rule.ack, response => {
                adapter.log.info(`Response: ${response}`);

                // somehow combine answers
                if (response) {
                    result += (result ? ', ' : '') + response;
                }

                if (adapter.config.writeEveryAnswer) {
                    void adapter.setState('response', response ?? null, true);
                }

                if (!--count) {
                    cb?.(result ? (withLang ? `${lang};` : '') + result : '');
                    cb = null;
                }
            });
        } else {
            count--;
            if (rule.ack) {
                result += (result ? ', ' : '') + getRandomPhrase(rule.ack);
            }
        }
    }

    if (!matchedRules.length) {
        if (!adapter.config.noNegativeMessage) {
            sayIDontUnderstand(lang, cmd, null, null, result => {
                cb?.(result ? (withLang ? `${lang};` : '') + result : '');
                cb = null;
            });
        } else {
            cb?.('');
            cb = null;
        }
    } else if (!count) {
        cb?.(result ? (withLang ? `${lang};` : '') + result : '');
        cb = null;
    }
}

async function main(): Promise<void> {
    rules = adapter.config.rules || [];

    commandsCallbacks = {
        whatTimeIsIt: sayTime,
        whatIsYourName: sayName,
        outsideTemperature: sayTemperature,
        insideTemperature: sayTemperature,
        functionOnOff: controlByFunction,
        blindsUpDown: controlBlinds,
        userDeviceControl,
        sendText,
        /* openLock, */
        userQuery,
        buildAnswer,
    };

    // read system configuration
    const obj = await adapter.getForeignObjectAsync('system.config');
    systemConfig = obj?.common || {};
    initSimpleControl(systemConfig, adapter);

    // read all enums
    enums = await adapter.getEnumsAsync('');
    initDevicesControl(enums, adapter);

    await adapter.subscribeForeignObjectsAsync('enum.*');

    if (adapter.config.processorId) {
        await adapter.subscribeForeignStatesAsync(adapter.config.processorId);
    }
}

// If started as allInOne mode => return function to create instance
if (require.main !== module) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
