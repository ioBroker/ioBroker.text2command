import { roomsDative, rooms } from './rooms';
import { functions, functionsAccusative } from './functions';
import { sayNoFunctionInThisRoom, sayNoSuchFunction, sayNoSuchRoom, sayNothingToDo } from './simpleAnswers';
import type { AnswerCallback, ControlCallback, RuleAck, RuleArgument } from './types';

/** All enums of the system, grouped by the enum type, e.g. `enum.rooms` */
export type Enums = Record<string, Record<string, ioBroker.EnumObject>>;

/** Extracts the desired value out of the spoken text */
type ValueExtractor = (lang: ioBroker.Languages, text: string) => boolean | number | null;

/** Builds the answer for the executed command */
type AnswerGenerator = (
    lang: ioBroker.Languages,
    sRoom: string,
    sFunction: string,
    valPercent: boolean | number,
) => string | undefined;

let enums: Enums;
let adapter: ioBroker.Adapter;

function getObjectName(lang: ioBroker.Languages, obj: ioBroker.AnyObject | null | undefined): string {
    if (!obj?.common?.name) {
        return '';
    }
    if (typeof obj.common.name === 'object') {
        return obj.common.name[lang] || obj.common.name.en;
    }
    return obj.common.name;
}

function findRoom(text: string, lang: ioBroker.Languages): string {
    let sRoom = '';
    for (const room in rooms) {
        const translation = rooms[room][lang];
        if (!translation) {
            continue;
        }
        const words = translation.split('/');
        for (let w = 0; w < words.length; w++) {
            if (text.includes(words[w])) {
                sRoom = room;
                break;
            }
        }
        if (sRoom) {
            break;
        }
    }

    return sRoom;
}

function findFunction(text: string, lang: ioBroker.Languages): string {
    let sFunction = '';
    for (const _f in functions) {
        const translation = functions[_f][lang];
        if (!translation) {
            continue;
        }
        const words = translation.split('/');
        for (let w = 0; w < words.length; w++) {
            if (text.includes(words[w])) {
                sFunction = _f;
                break;
            }
        }
        if (sFunction) {
            break;
        }
    }

    return sFunction;
}

function getEnum(enumType: string, text: string | string[], _enums: Enums): string[] | null {
    enumType = `enum.${enumType}`;
    if (!_enums[enumType]) {
        adapter.log.warn(`No enum "${enumType}" found.`);
        return null;
    }
    const texts = Array.isArray(text) ? text : text.split('/');

    for (let t = 0; t < texts.length; t++) {
        if (_enums[enumType][`${enumType}.${texts[t]}`]) {
            if (_enums[enumType][`${enumType}.${texts[t]}`].common) {
                return _enums[enumType][`${enumType}.${texts[t]}`].common.members || null;
            }
            adapter.log.error(`Invalid enum object "${enumType}.${texts[t]}"`);
            return null;
        }
        // sometimes rooms are in capital
        for (const rId in _enums[enumType]) {
            if (rId.toLowerCase().replace('_', '') === `${enumType}.${texts[t]}`) {
                if (_enums[enumType][rId].common) {
                    return _enums[enumType][rId].common.members || null;
                }
                adapter.log.error(`Invalid enum object "${rId}"`);
                return null;
            }
        }
    }
    return null;
}

function controlState(
    lang: ioBroker.Languages,
    obj: ioBroker.StateObject,
    value: boolean | number,
    use01: unknown,
    cb?: ControlCallback,
): void {
    if (obj.common.write === false) {
        return cb?.('cannot control');
    }

    // control switch
    if (obj.common.type === 'boolean' || obj.common.role.includes('switch')) {
        if (!use01) {
            value = !!value;
        }

        adapter.log.debug(`Control "${obj._id}"(${getObjectName(lang, obj)}) with ${value}`);

        adapter.setForeignState(obj._id, value, err => {
            if (err) {
                adapter.log.error(err.toString());
            }
            cb?.(err);
        });
    } else if (obj.common.type === 'number' || obj.common.role.includes('level')) {
        // control level
        if (value === true) {
            value = obj.common.max !== undefined ? obj.common.max : 100;
        } else if (value === false) {
            value = obj.common.min !== undefined ? obj.common.min : 0;
        }

        adapter.log.debug(`Control "${obj._id}"(${getObjectName(lang, obj)}) with ${value}`);

        adapter.setForeignState(obj._id, value, err => {
            if (err) {
                adapter.log.error(err.toString());
            }
            cb?.(err);
        });
    } else {
        adapter.log.warn(`Control of "${obj._id}" cannot by done, while type "${obj.common.type}" does not supported`);
        cb?.('invalid type');
    }
}

function controlDevice(
    lang: ioBroker.Languages,
    id: string,
    value: boolean | number,
    use01: unknown,
    cb?: ControlCallback,
): void {
    void adapter.getForeignObject(id, (err, obj) => {
        if (err) {
            adapter.log.error(err.toString());
        }
        const common = obj?.common as ioBroker.StateCommon | undefined;
        if (obj && common?.role) {
            if (
                !common.role.includes('switch') &&
                !common.role.includes('state') &&
                !common.role.includes('level') &&
                !common.role.includes('blind')
            ) {
                return cb?.('nothing to control');
            }
            if (obj.type !== 'state') {
                // try to find children
                adapter.getForeignObjects(`${id}.*`, (err, list) => {
                    if (err) {
                        adapter.log.warn(err.toString());
                    }
                    if (list) {
                        let childId: string;
                        // first look for direct roles, like: switch, state
                        for (childId in list) {
                            const child = list[childId] as ioBroker.StateObject;
                            if (
                                child.type === 'state' &&
                                child.common.write !== false &&
                                (child.common.role === 'switch' ||
                                    child.common.role === 'state' ||
                                    child.common.role === 'level' ||
                                    child.common.role === 'level.dimmer' ||
                                    child.common.role === 'level.blind')
                            ) {
                                if (value === true && child.common.max !== undefined) {
                                    value = child.common.max;
                                    use01 = true;
                                }
                                if (value === false && child.common.min !== undefined) {
                                    value = child.common.min;
                                    use01 = true;
                                }
                                controlState(lang, child, value, use01, cb);
                                return;
                            }
                        }
                        // then look for complex roles, like: switch.light, state.blinds
                        for (childId in list) {
                            const child = list[childId] as ioBroker.StateObject;
                            if (
                                child.type === 'state' &&
                                child.common.write !== false &&
                                (child.common.role.includes('switch') ||
                                    child.common.role.includes('state') ||
                                    child.common.role.includes('level'))
                            ) {
                                if (value === true && child.common.max !== undefined) {
                                    value = child.common.max;
                                    use01 = true;
                                }
                                if (value === false && child.common.min !== undefined) {
                                    value = child.common.min;
                                    use01 = true;
                                }
                                controlState(lang, child, value, use01, cb);
                                return;
                            }
                        }
                    }
                });
            } else {
                const stateObj = obj;
                if (value === true && stateObj.common.max !== undefined) {
                    value = stateObj.common.max;
                    use01 = true;
                }
                if (value === false && stateObj.common.min !== undefined) {
                    value = stateObj.common.min;
                    use01 = true;
                }
                controlState(lang, stateObj, value, use01, cb);
            }
        } else if (!obj) {
            adapter.log.warn(`Control of "${id}" cannot be done, because object not found`);
            cb?.(err || 'object not found');
        } else if (obj.common && !common?.role) {
            adapter.log.warn(`Control of "${id}" cannot be done, because role is empty`);
            cb?.(err || 'invalid role');
        } else {
            adapter.log.warn(`Control of "${id}" cannot be done, because invalid object`);
            cb?.(err || 'invalid object');
        }
    });
}

function extractOnOff(lang: ioBroker.Languages, text: string): boolean | null {
    const cmdWords = text.split(' ');
    let valPercent: boolean | null = null;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"

    if (lang === 'ru') {
        // test operation
        if (cmdWords.includes('включить') || cmdWords.includes('включи') || cmdWords.includes('ключи')) {
            valPercent = true;
        } else if (cmdWords.includes('выключи') || cmdWords.includes('выключить')) {
            valPercent = false;
        }
    } else if (lang === 'de') {
        // test operation
        if (cmdWords.includes('aus') || cmdWords.includes('ausmachen') || cmdWords.includes('ausschalten')) {
            valPercent = false;
        } else if (
            cmdWords.includes('an') ||
            cmdWords.includes('ein') ||
            cmdWords.includes('einmachen') ||
            cmdWords.includes('einschalten')
        ) {
            valPercent = true;
        }
    } else if (lang === 'en') {
        // test operation
        if (cmdWords.includes('on')) {
            valPercent = true;
        } else if (cmdWords.includes('off')) {
            valPercent = false;
        }
    }

    return valPercent;
}

function extractBlindCmd(lang: ioBroker.Languages, text: string): number | null {
    let valPercent: number | null = null;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        // test operation
        if (
            text.includes('открыть') ||
            text.includes('подними') ||
            text.includes('открой') ||
            text.includes('открою') ||
            text.includes('поднять')
        ) {
            valPercent = 100;
        } else if (
            text.includes('закрыть') ||
            text.includes('закрой') ||
            text.includes('закрою') ||
            text.includes('опусти') ||
            text.includes('опустить')
        ) {
            valPercent = 0;
        }
    } else if (lang === 'de') {
        // test operation
        if (text.includes(' auf') || text.includes('hoch') || text.includes('öffnen') || text.includes('aufmachen')) {
            valPercent = 100;
        } else if (
            text.includes('zumachen') ||
            text.includes(' zu') ||
            text.includes('schließen') ||
            text.includes('runter')
        ) {
            valPercent = 0;
        }
    } else if (lang === 'en') {
        // test operation
        if (text.includes('open')) {
            valPercent = 100;
        } else if (text.includes('close')) {
            valPercent = 0;
        }
    }
    return valPercent;
}

function generateAnswerOnOff(
    lang: ioBroker.Languages,
    sRoom: string,
    sFunction: string,
    valPercent: boolean | number,
): string | undefined {
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        let toSay: string;
        if (valPercent === true) {
            toSay = 'Switch on ';
        } else if (valPercent === false) {
            toSay = 'Switch off ';
        } else {
            toSay = 'Set ';
        }
        toSay += `${functionsAccusative[sFunction][lang]} `;
        toSay += roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ` to ${valPercent} percent`;
        }
        return toSay;
    }

    if (lang === 'de') {
        let toSay = valPercent === true || valPercent === false ? 'Schalte ' : 'Setze ';
        toSay += `${functionsAccusative[sFunction][lang]} `;
        toSay += roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            toSay += ` auf ${valPercent} Prozent`;
        }
        if (valPercent === false) {
            toSay += ' aus';
        } else if (valPercent === true) {
            toSay += ' ein';
        }
        return toSay;
    }

    if (lang === 'ru') {
        let toSay: string;
        if (valPercent === true) {
            toSay = 'Включаю ';
        } else if (valPercent === false) {
            toSay = 'Выключаю ';
        } else {
            toSay = 'Устанавливаю ';
        }
        toSay += `${functionsAccusative[sFunction][lang]} `;
        toSay += roomsDative[sRoom][lang];
        if (valPercent !== true && valPercent !== false) {
            let nn = parseFloat(String(valPercent));
            toSay += ` на ${valPercent} `;
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
        return toSay;
    }

    return undefined;
}

function generateAnswerBlinds(
    lang: ioBroker.Languages,
    sRoom: string,
    _sFunction: string,
    value: boolean | number,
): string | undefined {
    const valPercent = parseFloat(String(value));

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        return `${valPercent >= 50 ? 'Open' : 'Close'} the shutter ${roomsDative[sRoom][lang]}${
            valPercent !== 0 && valPercent !== 100 ? ` on ${valPercent} percent` : ''
        }`;
    }

    if (lang === 'de') {
        return `${valPercent >= 50 ? 'Öffne' : 'Schließe'} Rollladen ${roomsDative[sRoom][lang]}${
            valPercent !== 0 && valPercent !== 100 ? ` auf ${valPercent} Prozent` : ''
        }`;
    }

    if (lang === 'ru') {
        let toSay = `${valPercent >= 50 ? 'Открываю' : 'Закрываю'} окна ${roomsDative[sRoom][lang]}`;

        if (valPercent !== 0 && valPercent !== 1) {
            toSay += ` на ${valPercent} `;
            if (valPercent > 4 && valPercent < 21) {
                toSay += 'процентов';
            } else {
                const nn = valPercent % 10;
                if (nn === 1) {
                    toSay += 'процент';
                } else if (nn === 2 || nn === 3 || nn === 4) {
                    toSay += 'процентa';
                } else {
                    toSay += 'процентов';
                }
            }
        }
        return toSay;
    }

    return undefined;
}

function controlByFunctionHelper(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
    sFunction: string | null,
    extractValue: ValueExtractor,
    generateAnswer: AnswerGenerator,
): void {
    // try to extract default room: "some command[default room]"
    const defaultRoomMatch = text.match(/\[(.+)]/);
    let defaultRoom = '';
    if (defaultRoomMatch) {
        text = text.replace(defaultRoomMatch[0], '');
        defaultRoom = defaultRoomMatch[1];
    }

    // try to extract boolean command
    let valPercent: boolean | number | null = extractValue(lang, text);

    // find room
    let sRoom = findRoom(text, lang);
    if (!sRoom && defaultRoom) {
        sRoom = findRoom(defaultRoom, lang);
    }

    // find function: e.g "light/dimmer"
    sFunction = sFunction || findFunction(text, lang);

    // Find any number
    const m = text.match(/\b(\d+)\b/);
    if (m) {
        valPercent = parseInt(m[1], 10);
    }

    // Don't know what to do
    if (valPercent === null) {
        sayNothingToDo(lang, text, args, ack, cb);
        return;
    }

    let devicesInRoom: string[] | null = null;
    // try to find enum for room
    if (sRoom !== 'everywhere') {
        devicesInRoom = getEnum('rooms', sRoom, enums);
        // Unknown room
        if (!devicesInRoom) {
            sayNoSuchRoom(lang, text, args, ack, cb);
            return;
        }
    }

    // try to find enum for function
    const devicesInFunction = getEnum('functions', sFunction, enums);
    // Unknown function/role
    if (!devicesInFunction) {
        sayNoSuchFunction(lang, text, args, ack, cb);
        return;
    }

    let anyControlled = false;
    const toSay = ack ? generateAnswer(lang, sRoom, sFunction, valPercent) : null;

    // if convert true/false to 1/0
    if (args?.[0]) {
        if (valPercent === true) {
            valPercent = 1;
        }
        if (valPercent === false) {
            valPercent = 0;
        }
    }

    let count = 0;
    if (sRoom === 'everywhere') {
        for (let f = 0; f < devicesInFunction.length; f++) {
            count++;
            controlDevice(lang, devicesInFunction[f], valPercent, args?.[0], err => {
                if (!err) {
                    anyControlled = true;
                }
                if (!--count) {
                    if (!anyControlled) {
                        sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
                    } else {
                        cb(toSay);
                    }
                }
            });
        }
    } else if (devicesInRoom) {
        // Try to find overlapping of devicesInRoom and devicesInFunction
        for (let r = 0; r < devicesInRoom.length; r++) {
            if (devicesInFunction.includes(devicesInRoom[r])) {
                count++;
                controlDevice(lang, devicesInRoom[r], valPercent, args?.[0], err => {
                    if (!err) {
                        anyControlled = true;
                    }
                    setTimeout(() => {
                        if (!--count) {
                            if (!anyControlled) {
                                sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
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
    if (!count) {
        sayNoFunctionInThisRoom(lang, text, [sRoom, sFunction], ack, cb);
    }
}

export function controlByFunction(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    controlByFunctionHelper(lang, text, args, ack, cb, null, extractOnOff, generateAnswerOnOff);
}

export function controlBlinds(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    controlByFunctionHelper(lang, text, args, ack, cb, 'blinds', extractBlindCmd, generateAnswerBlinds);
}

/**
 * Provide the enums and the adapter instance to this module
 *
 * @param _enums all enums of the system
 * @param _adapter adapter instance. Could be omitted if it was set before
 */
export function init(_enums: Enums, _adapter?: ioBroker.Adapter): void {
    enums = _enums;
    if (_adapter) {
        adapter = _adapter;
    }
}
