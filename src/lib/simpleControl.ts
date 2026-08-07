// TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"

import { getRandomPhrase, sayError, sayIDontKnow, sayNoName, sayNothingToDo } from './simpleAnswers';
import { formatInterval } from './formatProvider'; // todo use formatProvider from js-controller/lib, if implemented
import type { AnswerCallback, RuleAck, RuleArgument, RuleWords } from './types';

/** One of the words that are interpreted as `true`/`false`, together with its cached regular expression */
interface BooleanWord {
    regexp: RegExp;
    text: string;
}

/** Argument of the `eval` operation of a binding */
export interface BindingEvalArgument {
    name: string;
    visOid: string;
    systemOid: string;
}

/** One operation that must be applied on the value of a binding */
export interface BindingOperation {
    op: string;
    arg?: number | string | string[] | BindingEvalArgument[];
    formula?: string;
}

/** One `{objectID;operation}` binding, extracted out of an answer template */
export interface Binding {
    visOid: string;
    systemOid: string;
    token: string;
    operations?: BindingOperation[];
    format: string;
    isSeconds: boolean;
    attr: string;
}

/** Called with the answer template, where all bindings are already replaced with the values */
type TemplateCallback = (error: Error | null, format: RuleAck) => void;

const yes: (string | BooleanWord)[] = ['true', 'active', 'ja', 'aktiv', 'да', 'активно', 'активна', 'активный'];
const no: (string | BooleanWord)[] = [
    'false',
    'inactive',
    'nein',
    'inaktiv',
    'нет',
    'неактивно',
    'неактивна',
    'неактивный',
];

let adapter: ioBroker.Adapter;
let systemConfig: Partial<ioBroker.SystemConfigCommon>;

/**
 * Provide the system configuration and the adapter instance to this module
 *
 * @param _systemConfig `common` part of the `system.config` object
 * @param _adapter adapter instance. Could be omitted if it was set before
 */
export function init(_systemConfig: Partial<ioBroker.SystemConfigCommon>, _adapter?: ioBroker.Adapter): void {
    if (_adapter) {
        adapter = _adapter;
    }
    systemConfig = _systemConfig;
}

const rusHours = [
    'ноль часов',
    'один час',
    'два часа',
    'три часа',
    'четыре часа',
    'пять часов',
    'шесть часов',
    'семь часов',
    'восемь часов',
    'девять часов',
    'десять часов',
    'одиннадцать часов',
    'двенадцать часов',
    'тринадцать часов',
    'четырнадцать часов',
    'пятнадцать часов',
    'шестнадцать часов',
    'семнадцать часов',
    'восемнадцать часов',
    'девятнадцать часов',
    'двадцать часов',
    'двадцать один час',
    'двадцать два часа',
    'двадцать три часа',
    'двадцать четыре часа',
];
const rusMinutes = [
    '',
    'одна минута',
    'две минуты',
    'три минуты',
    'четыре минуты',
    'пять минут',
    'шесть минут',
    'семь минут',
    'восемь минут',
    'девять минут',
    'десять минут',
    'одиннадцать минут',
    'двенадцать минут',
    'тринадцать минут',
    'четырнадцать минут',
    'пятнадцать минут',
    'шестнадцать минут',
    'семнадцать минут',
    'восемнадцать минут',
    'девятнадцать минут',
    'двадцать минут',
    'двадцать одна минута',
    'двадцать две минуты',
    'двадцать три минуты',
    'двадцать четыре минуты',
    'двадцать пять минут',
    'двадцать шесть минут',
    'двадцать семь минут',
    'двадцать восемь минут',
    'двадцать девять минут',
    'тридцать минут',
    'тридцать одна минута',
    'тридцать две минуты',
    'тридцать три минуты',
    'тридцать четыре минуты',
    'тридцать пять минут',
    'тридцать шесть минут',
    'тридцать семь минут',
    'тридцать восемь минут',
    'тридцать девять минут',
    'сорок минут',
    'сорок одна минута',
    'сорок две минуты',
    'сорок три минуты',
    'сорок четыре минуты',
    'сорок пять минут',
    'сорок шесть минут',
    'сорок семь минут',
    'сорок восемь минут',
    'сорок девять минут',
    'пятьдесят минут',
    'пятьдесят одна минута',
    'пятьдесят две минуты',
    'пятьдесят три минуты',
    'пятьдесят четыре минуты',
    'пятьдесят пять минут',
    'пятьдесят шесть минут',
    'пятьдесят семь минут',
    'пятьдесят восемь минут',
    'пятьдесят девять минут',
    'шестьдесят минут',
];

/**
 * Convert a rule argument to text.
 *
 * `userDeviceControl` can store an already parsed state object in an argument,
 * which is stringified as `[object Object]`, exactly like before.
 *
 * @param value value of the argument
 */
function argToText(value: RuleArgument): string {
    if (typeof value === 'object' && value !== null) {
        return Object.prototype.toString.call(value);
    }
    return String(value);
}

function getObjectName(lang: ioBroker.Languages, obj: ioBroker.AnyObject | null | undefined): string {
    if (!obj?.common?.name) {
        return '';
    }
    if (typeof obj.common.name === 'object') {
        return obj.common.name[lang] || obj.common.name.en;
    }
    return obj.common.name;
}

export function sayTime(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | undefined,
    _ack: RuleAck,
    cb: AnswerCallback,
): void {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();

    if (lang === 'ru') {
        cb(`${rusHours[h]} ${rusMinutes[m]}`);
        return;
    }

    cb(`${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`);
}

export function sayName(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    if (ack) {
        cb(getRandomPhrase(ack));
    } else {
        sayNoName(lang, text, args, ack, cb);
    }
}

export function sayTemperature(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    if (!args?.[0]) {
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }
    if (!adapter) {
        console.warn('Driver is not yet started!');
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }
    const id = args[0] as string;

    void adapter.getForeignObject(id, (_err, obj) => {
        if (!obj) {
            sayIDontKnow(lang, text, args, ack, cb);
            return;
        }

        void adapter.getForeignState(id, (_err, state) => {
            if (state?.val === null || state?.val === undefined) {
                sayIDontKnow(lang, text, args, ack, cb);
                return;
            }
            let ackText = getRandomPhrase(ack);

            let round = parseInt(argToText(args[1] || 0), 10) || 0;
            if (round < 0 || round > 100) {
                adapter.log.info(`Invalid round parameter: ${round}. Reset to 2`);
                round = 2;
            }

            // replace , with . | convert to float and round to integer
            const t = parseFloat(String(state.val).replace('&deg;', '').replace(',', '.')).toFixed(round);

            let u = (obj.common as ioBroker.StateCommon)?.unit || systemConfig.tempUnit;
            u = u || '°C';

            if (!ackText) {
                if (lang === 'ru') {
                    ackText = 'Температура %s %u';
                } else if (lang === 'de') {
                    ackText = 'Temperatur ist %s %u';
                } else if (lang === 'en') {
                    ackText = 'Temperature is %s %u';
                }
            }

            if (!ackText) {
                adapter.log.error(`Language ${lang} is not supported`);
                cb();
                return;
            }

            // normally people know what the units are used
            if (u === '°C' || u === '°F') {
                u = '';
            }

            const units = u;

            parseTemplates(lang, ackText, (_error, parsedAck) => {
                const template = parsedAck as string;
                let tText = t;
                // read settings from systemConfig
                if (systemConfig.isFloatComma) {
                    tText = tText.replace('.', ',');
                }

                if (lang === 'ru') {
                    // get last digit
                    const tNum = parseFloat(t);
                    const tr = tNum % 10;
                    const tc = ~~(tNum / 10);
                    if (tc === 1 && tr >= 1 && tr <= 4) {
                        cb(
                            template
                                .replace('%s', tText)
                                .replace('%u', 'градусов')
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    } else if (tr === 1) {
                        cb(
                            template
                                .replace('%s', tText)
                                .replace('%u', `градус ${units}`)
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    } else if (tr >= 2 && tr <= 4) {
                        cb(
                            template
                                .replace('%s', tText)
                                .replace('%u', `градуса ${units}`)
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    } else {
                        cb(
                            template
                                .replace('%s', tText)
                                .replace('%u', 'градусов')
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    }
                } else if (lang === 'de') {
                    cb(template.replace('%s', tText).replace('%u', 'Grad').replace('%n', getObjectName(lang, obj)));
                } else if (lang === 'en') {
                    cb(template.replace('%s', tText).replace('%u', 'degrees').replace('%n', getObjectName(lang, obj)));
                } else {
                    adapter.log.error(`Language ${lang} is not supported`);
                    cb();
                }
            });
        });
    });
}

export function userDeviceControl(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    if (!args?.[0]) {
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }
    if (!adapter) {
        console.warn('Driver is not yet started!');
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }
    const id = args[0] as string;
    adapter.log.info(`Control ID "${id}" with: ${argToText(args[1])}`);

    if (typeof args[1] === 'string' && args[1] !== '') {
        // try to parse "{val: 5, ack: true}"
        if (args[1][0] === '{') {
            let oobb: ioBroker.SettableState | undefined;
            try {
                oobb = JSON.parse(args[1]) as ioBroker.SettableState;
            } catch {
                // ignore it
            }
            if (oobb && oobb.val !== undefined) {
                args[1] = oobb;
            }
        }

        if (typeof args[1] === 'string') {
            if (args[1] === 'true') {
                args[1] = true;
            } else if (args[1] === 'false') {
                args[1] = false;
            } else {
                const f = parseFloat(args[1]);
                if (f.toString() === args[1]) {
                    args[1] = f;
                }
            }
        }
    }

    // Find any number input = "einschalten auf -20%"
    let m = text ? text.match(/([-+]\d+[.,]?\d*)\b/) : null;
    if (!m) {
        m = text ? text.match(/\b(\d+[.,]?\d*)\b/) : null;
    }
    if (m) {
        args[1] = parseFloat(m[1].replace(',', '.'));
    }

    void adapter.getForeignObject(id, (err, obj) => {
        if (err) {
            adapter.log.warn(err.toString());
        }

        if (obj) {
            const common = obj.common as ioBroker.StateCommon | undefined;
            if (common) {
                if (common.write === false) {
                    adapter.log.error(`Cannot control read only "${id}"`);
                    if (lang === 'de') {
                        void adapter.setState('error', `Kann die Read-only-Variable "${id}" nicht steuern`, true);
                    } else if (lang === 'ru') {
                        void adapter.setState('error', `Нельзя контролировать объект "${id}" только для чтения`, true);
                    } else {
                        void adapter.setState('error', `Cannot control read only "${id}"`, true);
                    }
                    sayError(lang, `Cannot control read only "${id}"`, args, ack, cb);
                    return;
                }

                if (common.type === 'number' || common.role?.includes('level')) {
                    if (args[1] === true) {
                        args[1] = 1;
                    }
                    if (args[1] === false) {
                        args[1] = 0;
                    }
                } else if (common.type === 'boolean' || common.role?.includes('switch')) {
                    args[1] = !!args[1];
                }
            }
            const units = common?.unit || '';

            adapter.log.debug(`userDeviceControl into "${id}": ${argToText(args[1])}`);

            adapter.setForeignState(id, args[1] as ioBroker.State | ioBroker.StateValue, err => {
                if (err) {
                    adapter.log.error(err.toString());
                    void adapter.setState('error', err.toString(), true);
                    sayError(lang, err.toString(), args, ack, cb);
                } else if (ack) {
                    parseTemplates(lang, ack, (_error, parsedAck) => {
                        let tText = argToText(args[1]);
                        if (args[1] === null || args[1] === undefined) {
                            args[1] = '';
                        }
                        // read settings from systemConfig
                        if (systemConfig.isFloatComma && tText === parseFloat(tText).toString()) {
                            tText = tText.replace('.', ',');
                        }

                        cb(
                            getRandomPhrase(parsedAck)
                                .replace('%s', tText)
                                .replace('%u', units)
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    });
                } else {
                    cb();
                }
            });
        } else {
            adapter.log.warn(`Object "${id}" does not exist!`);
            cb('');
        }
    });
}

/** Result of {@link getStateAndUnit} */
interface StateAndUnit {
    obj?: ioBroker.Object | null;
    state?: ioBroker.State | null;
    units?: string;
    error?: Error;
}

async function getStateAndUnit(id: string | undefined, lang: ioBroker.Languages): Promise<StateAndUnit> {
    let obj: ioBroker.Object | null | undefined;
    let state: ioBroker.State | null | undefined;
    let units = '';

    if (id) {
        try {
            obj = await adapter.getForeignObjectAsync(id);
            state = await adapter.getForeignStateAsync(id);
        } catch (error) {
            return { error: error as Error };
        }

        const common = obj?.common as ioBroker.StateCommon | undefined;
        if (common) {
            units = common.unit || '';
        }

        if (state && (units === '°C' || units === '°F')) {
            state.val = Math.round(Number(state.val) * 10) / 10;

            if (lang === 'ru') {
                units = state.val === 1 ? 'градус' : 'градусов';
            } else if (lang === 'de') {
                units = 'Grad';
            } else if (lang === 'en') {
                units = state.val === 1 ? 'degree' : 'degrees';
            }
        }

        if (state) {
            if (state.val === 'true' || state.val === true) {
                if (lang === 'ru') {
                    state.val = ' да';
                } else if (lang === 'de') {
                    state.val = ' ja';
                } else if (lang === 'en') {
                    state.val = ' yes';
                }
            } else if (state.val === 'false' || state.val === false) {
                if (lang === 'ru') {
                    state.val = ' нет';
                } else if (lang === 'de') {
                    state.val = ' nein';
                } else if (lang === 'en') {
                    state.val = ' no';
                }
            }
        }
    }

    return { obj, state, units };
}

export function userQuery(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    if (!args?.[0]) {
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }

    if (!adapter) {
        console.warn('Driver is not yet started!');
        sayIDontKnow(lang, text, args, ack, cb);
        return;
    }

    adapter.log.info(`Say ID ${args[0] as string}`);

    const id0 = args[0] as string;
    const convertToYes = args[1];
    const id1 = args[2] as string | undefined;
    const id2 = args[3] as string | undefined;

    getStateAndUnit(id0, lang)
        .then(async data0 => {
            if (data0.error) {
                adapter.log.error(`Cannot read ID ${id0}: ${data0.error.toString()}`);
                void adapter.setState('error', data0.error.toString(), true);
                sayError(lang, data0.error.toString(), args, ack, cb);
                return;
            }
            if (!id0 || !data0.obj) {
                adapter.log.warn(`Object "${id0}" does not exist!`);
                cb('');
                return;
            }
            if (!data0.state || data0.state.val === null || data0.state.val === undefined) {
                sayIDontKnow(lang, text, args, ack, cb);
                return;
            }

            const state0 = data0.state;

            if (convertToYes) {
                if (state0.val === '1' || state0.val === 1) {
                    state0.val = true;
                } else if (state0.val === '0' || state0.val === 0) {
                    state0.val = false;
                }
            }

            const data1 = await getStateAndUnit(id1, lang);
            const data2 = await getStateAndUnit(id2, lang);

            const error = data1.error || data2.error;
            if (error) {
                adapter.log.error(`Cannot read ID ${id1}: ${error.toString()}`);
                void adapter.setState('error', error.toString(), true);
                sayError(lang, error.toString(), args, ack, cb);
                return;
            }

            parseTemplates(lang, ack, (_error, parsedAck) => {
                let tText0 = String(state0.val);
                // read settings from systemConfig
                if (systemConfig.isFloatComma && tText0 === parseFloat(tText0).toString()) {
                    tText0 = tText0.replace('.', ',');
                }

                let tText1 = data1.state ? String(data1.state.val) : '';
                // read settings from systemConfig
                if (systemConfig.isFloatComma && tText1 && tText1 === parseFloat(tText1).toString()) {
                    tText1 = tText1.replace('.', ',');
                }

                let tText2 = data2.state ? String(data2.state.val) : '';
                // read settings from systemConfig
                if (systemConfig.isFloatComma && tText2 && tText2 === parseFloat(tText2).toString()) {
                    tText2 = tText2.replace('.', ',');
                }

                cb(
                    getRandomPhrase(parsedAck)
                        .replace('%s', tText0)
                        .replace('%u', data0.units || '')
                        .replace('%n', getObjectName(lang, data0.obj))
                        .replace('%s1', tText1)
                        .replace('%u1', data1.units || '')
                        .replace('%n1', getObjectName(lang, data1.obj))
                        .replace('%s2', tText2)
                        .replace('%u2', data2.units || '')
                        .replace('%n2', getObjectName(lang, data2.obj)),
                );
            });
        })
        .catch((error: Error) => {
            adapter.log.warn(error.toString());
            adapter.log.error(`Cannot read ID ${id1}: ${error.toString()}`);
            void adapter.setState('error', error.toString(), true);
            sayError(lang, error.toString(), args, ack, cb);
        });
}

export function buildAnswer(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    parseTemplates(lang, ack, (_error, parsedAck) => cb(getRandomPhrase(parsedAck)));
}

/**
 * Cut the detected words from the text, so only the "payload" of the command remains
 *
 * @param text lower-cased text, where the words were detected
 * @param originalText text in the original case, that will be cut
 * @param words words of the rule
 */
export function extractText(text: string, originalText: string, words: RuleWords | undefined): string {
    if (typeof words === 'string') {
        words = words.split(' ');
    }
    if (!adapter) {
        console.warn('Driver is not yet started!');
        return originalText;
    }
    if (!Array.isArray(words)) {
        adapter.log.error(`Invalid Rule definition: ${JSON.stringify(words)}`);
        return originalText;
    }
    adapter.log.debug(`Words: ${JSON.stringify(words)}`);
    let max = 0;
    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        const parts: string[] = Array.isArray(word) ? word : (word || '').toString().split('/');

        for (let p = 0; p < parts.length; p++) {
            if (parts[p][0] === '[') {
                parts[p] = parts[p].substring(1);
            }
            if (parts[p][parts[p].length - 1] === ']') {
                parts[p] = parts[p].substring(0, parts[p].length - 1);
            }
            const pos = text.indexOf(parts[p]);
            if (pos !== -1 && pos + parts[p].length > max) {
                max = pos + parts[p].length;
            }
        }
    }
    // find end of word
    while (max < text.length && text[max] !== ' ') {
        max++;
    }
    // skip space
    max++;
    return originalText.substring(max);
}

/**
 * Extract all `{objectID;operation}` bindings out of an answer template
 *
 * @param format answer template
 */
export function extractBinding(format: unknown): Binding[] | null {
    if (typeof format !== 'string') {
        return null;
    }
    const oid = format.match(/{(.+?)}/g);
    let result: Binding[] | null = null;

    if (oid) {
        if (oid.length > 50) {
            console.warn(`Too many bindings in one widget: ${oid.length}[max = 50]`);
        }
        for (let p = 0; p < oid.length && p < 50; p++) {
            const _oid = oid[p].substring(1, oid[p].length - 1);
            // If first symbol '"' => it is JSON
            if (_oid[0] === '{' || (_oid && _oid[0] === '"')) {
                continue;
            }
            const parts = _oid.split(';');
            result = result || [];
            let systemOid = parts[0].trim();
            let visOid = systemOid;

            let test1 = visOid.substring(visOid.length - 4);
            let test2 = visOid.substring(visOid.length - 3);

            if (visOid && test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                visOid = `${visOid}.val`;
            }

            const isSeconds = test2 === '.ts' || test2 === '.lc';
            let attr = 'val';

            test1 = systemOid.substring(systemOid.length - 4);
            test2 = systemOid.substring(systemOid.length - 3);

            if (test1 === '.val' || test1 === '.ack') {
                systemOid = systemOid.substring(0, systemOid.length - 4);
                attr = test1.slice(1);
            } else if (test2 === '.lc' || test2 === '.ts') {
                systemOid = systemOid.substring(0, systemOid.length - 3);
                attr = test2.slice(1);
            }
            let operations: BindingOperation[] | null = null;
            // (visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);
            const isEval = !!visOid.match(/[\d\w_.]+:\s?[-\d\w_.]+/) || (!visOid.length && parts.length > 0);

            if (isEval) {
                const xx = visOid.split(':', 2);
                const yy = systemOid.split(':', 2);
                visOid = xx[1];
                systemOid = yy[1];
                operations = [
                    {
                        op: 'eval',
                        arg: [
                            {
                                name: xx[0],
                                visOid,
                                systemOid,
                            },
                        ],
                    },
                ];
            }

            for (let u = 1; u < parts.length; u++) {
                // eval construction
                if (isEval && operations) {
                    if (parts[u].trim().match(/^[\d\w_.]+:\s?[-.\d\w_]+$/)) {
                        // parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
                        let _systemOid = parts[u].trim();
                        let _visOid = _systemOid;

                        test1 = _visOid.substring(_visOid.length - 4);
                        test2 = _visOid.substring(_visOid.length - 3);

                        if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                            _visOid = `${_visOid}.val`;
                        }

                        test1 = systemOid.substring(_systemOid.length - 4);
                        test2 = systemOid.substring(_systemOid.length - 3);

                        if (test1 === '.val' || test1 === '.ack') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                        } else if (test2 === '.lc' || test2 === '.ts') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                        }
                        const x1 = _visOid.split(':', 2);
                        const y1 = _systemOid.split(':', 2);

                        (operations[0].arg as BindingEvalArgument[]).push({
                            name: x1[0],
                            visOid: x1[1],
                            systemOid: y1[1],
                        });
                    } else {
                        parts[u] = parts[u].replace(/::/g, ':');
                        if (operations[0].formula) {
                            const n: BindingOperation = JSON.parse(JSON.stringify(operations[0])) as BindingOperation;
                            n.formula = parts[u];
                            operations.push(n);
                        } else {
                            operations[0].formula = parts[u];
                        }
                    }
                } else {
                    const parse = parts[u].match(/([\w\s/+*-]+)(\(.+\))?/);
                    if (parse?.[1]) {
                        const op = parse[1].trim();
                        const rawArg: string | undefined = parse[2];

                        // operators requires parameter
                        if (
                            op === '*' ||
                            op === '+' ||
                            op === '-' ||
                            op === '/' ||
                            op === '%' ||
                            op === 'min' ||
                            op === 'max'
                        ) {
                            if (rawArg === undefined) {
                                console.log(`Invalid format of format string: ${format}`);
                            } else {
                                let param = rawArg.trim().replace(',', '.');
                                param = param.substring(1, param.length - 1);
                                const arg = parseFloat(param.trim());

                                if (arg.toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                } else {
                                    operations = operations || [];
                                    operations.push({ op, arg });
                                }
                            }
                        } else if (op === 'date' || op === 'dateinterval') {
                            // date formatting
                            operations = operations || [];
                            let param = (rawArg || '').trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op, arg: param });
                        } else if (op === 'array') {
                            // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                            operations = operations || [];
                            let param = (rawArg || '').trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op, arg: param.split(',') });
                        } else if (op === 'value') {
                            // value formatting
                            operations = operations || [];
                            let param = rawArg === undefined ? '(2)' : rawArg || '';
                            param = param.trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op, arg: param });
                        } else if (op === 'pow' || op === 'round' || op === 'random') {
                            // operators have optional parameter
                            if (rawArg === undefined) {
                                operations = operations || [];
                                operations.push({ op });
                            } else {
                                let param = rawArg.trim().replace(',', '.');
                                param = param.substring(1, param.length - 1);
                                const arg = parseFloat(param.trim());

                                if (arg.toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                } else {
                                    operations = operations || [];
                                    operations.push({ op, arg });
                                }
                            }
                        } else {
                            // operators without parameter
                            operations = operations || [];
                            operations.push({ op });
                        }
                    } else {
                        console.log(`Invalid format ${format}`);
                    }
                }
            }

            result.push({
                visOid,
                systemOid,
                token: oid[p],
                operations: operations ? operations : undefined,
                format,
                isSeconds,
                attr,
            });
        }
    }
    return result;
}

/**
 * Read all states used in the answer template and replace the bindings with their values
 *
 * @param lang language of the answer
 * @param format answer template
 * @param cb called with the resulting text
 */
export function parseTemplates(lang: ioBroker.Languages, format: RuleAck, cb: TemplateCallback): void {
    const oids = extractBinding(format);

    if (!adapter) {
        console.warn('Driver is not yet started!');
        cb(null, format);
        return;
    }

    if (!oids) {
        cb(null, format);
        return;
    }

    const values: Record<string, ioBroker.StateValue> = {};
    let pending = oids.length;

    for (let t = 0; t < oids.length; t++) {
        if (oids[t].visOid && values[oids[t].visOid] === undefined) {
            void adapter.getForeignState(oids[t].systemOid, (_err, state) => {
                let value: ioBroker.StateValue = state
                    ? (state[(oids[t].attr || 'val') as keyof ioBroker.State] as ioBroker.StateValue)
                    : '';
                if (value === undefined || value === null) {
                    value = '';
                }
                // read settings from systemConfig
                if (systemConfig.isFloatComma && value.toString() === parseFloat(String(value)).toString()) {
                    value = value.toString().replace('.', ',');
                }
                values[oids[t].visOid] = value;

                if (!--pending) {
                    setImmediate(executeTemplates, lang, format as string, cb, values, oids);
                }
            });
        } else {
            pending--;
            if (!pending) {
                executeTemplates(lang, format as string, cb, values, oids);
            }
        }
    }
}

function executeTemplates(
    lang: ioBroker.Languages,
    format: string,
    cb: TemplateCallback,
    values: Record<string, ioBroker.StateValue>,
    oids: Binding[],
): void {
    for (let t = 0; t < oids.length; t++) {
        let value: any = values[oids[t].visOid];
        const operations = oids[t].operations;
        if (operations) {
            for (let k = 0; k < operations.length; k++) {
                const arg = operations[k].arg;
                switch (operations[k].op) {
                    case 'eval': {
                        let script = ''; // '(function() {';
                        const evalArgs = arg as BindingEvalArgument[];
                        for (let a = 0; a < evalArgs.length; a++) {
                            if (!evalArgs[a].name) {
                                continue;
                            }
                            value = values[evalArgs[a].visOid];
                            script += `var ${evalArgs[a].name} = "${String(value)}";`;
                        }
                        script += `return ${operations[k].formula};`;
                        // script += '}())';
                        try {
                            value = new Function(script)();
                        } catch (e) {
                            console.error(`Error in eval[value]     : ${format}`);
                            console.error(`Error in eval[script]: ${script}`);
                            console.error(`Error in eval[error] : ${e as string}`);
                            value = 0;
                        }
                        break;
                    }
                    case '*':
                        if (arg !== undefined) {
                            value = parseFloat(value) * (arg as number);
                        }
                        break;
                    case '/':
                        if (arg !== undefined) {
                            value = parseFloat(value) / (arg as number);
                        }
                        break;
                    case '+':
                        if (arg !== undefined) {
                            value = parseFloat(value) + (arg as number);
                        }
                        break;
                    case '-':
                        if (arg !== undefined) {
                            value = parseFloat(value) - (arg as number);
                        }
                        break;
                    case '%':
                        if (arg !== undefined) {
                            value = parseFloat(value) % (arg as number);
                        }
                        break;
                    case 'round':
                        if (arg === undefined) {
                            value = Math.round(parseFloat(value));
                        } else {
                            value = parseFloat(value).toFixed(arg as number);
                        }
                        break;
                    case 'pow':
                        if (arg === undefined) {
                            value = Math.pow(parseFloat(value), 2);
                        } else {
                            value = Math.pow(parseFloat(value), arg as number);
                        }
                        break;
                    case 'sqrt':
                        value = Math.sqrt(parseFloat(value));
                        break;
                    case 'hex':
                        value = Math.round(parseFloat(value)).toString(16);
                        break;
                    case 'hex2':
                        value = Math.round(parseFloat(value)).toString(16);
                        if (value.length < 2) {
                            value = `0${value}`;
                        }
                        break;
                    case 'HEX':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        break;
                    case 'HEX2':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        if (value.length < 2) {
                            value = `0${value}`;
                        }
                        break;
                    case 'value':
                        value = adapter.formatValue(value, parseInt(arg as string, 10));
                        break;
                    case 'array':
                        value = (arg as string[])[~~Number(value)];
                        break;
                    case 'date':
                        value = adapter.formatDate(value, arg as string);
                        break;
                    case 'dateinterval':
                        value = formatInterval(value, arg as string, lang);
                        break;
                    case 'min':
                        value = parseFloat(value);
                        value = value < (arg as number) ? arg : value;
                        break;
                    case 'max':
                        value = parseFloat(value);
                        value = value > (arg as number) ? arg : value;
                        break;
                    case 'random':
                        if (arg === undefined) {
                            value = Math.random();
                        } else {
                            value = Math.random() * (arg as number);
                        }
                        break;
                    case 'floor':
                        value = Math.floor(parseFloat(value));
                        break;
                    case 'ceil':
                        value = Math.ceil(parseFloat(value));
                        break;
                } // switch
            }
        } // if for
        format = format.replace(oids[t].token, String(value));
    } // for
    format = format.replace(/{{/g, '{').replace(/}}/g, '}');
    cb(null, format);
}

export function sendText(
    lang: ioBroker.Languages,
    text: string,
    args: RuleArgument[] | undefined,
    ack: RuleAck,
    cb: AnswerCallback,
): void {
    if (!args?.[0]) {
        sayNothingToDo(lang, text, args, ack, cb);
        return;
    }

    if (!adapter) {
        console.warn('Driver is not yet started!');
        cb('');
        return;
    }

    const id = args[0] as string;

    if (args[1]) {
        let tText = text.toString();

        // read settings from systemConfig
        if (systemConfig.isFloatComma && tText === parseFloat(tText).toString()) {
            tText = tText.replace('.', ',');
        }

        text = argToText(args[1]).replace('%s', tText);
    }

    parseTemplates(lang, text, (_error, parsedText) => {
        const template = parsedText as string;
        adapter.log.info(`Say ID ${id}: ${template}`);

        void adapter.getForeignObject(id, (err, obj) => {
            if (err) {
                adapter.log.warn(err.toString());
            }
            if (obj) {
                const common = obj.common as ioBroker.StateCommon | undefined;
                const units = common?.unit || '';

                let value: ioBroker.StateValue = template;
                let response: string | number | boolean = template;

                if (common?.type === 'boolean') {
                    for (let i = 0; i < yes.length; i++) {
                        let entry = yes[i];
                        if (typeof entry === 'string') {
                            entry = { regexp: new RegExp(`\\b${entry}\\b`, 'i'), text: entry };
                            yes[i] = entry;
                        }
                        if (entry.regexp.test(String(value))) {
                            response = entry.text;
                            value = true;
                            break;
                        }
                    }
                    for (let j = 0; j < no.length; j++) {
                        let entry = no[j];
                        if (typeof entry === 'string') {
                            entry = { regexp: new RegExp(`\\b${entry}\\b`, 'i'), text: entry };
                            no[j] = entry;
                        }
                        if (entry.regexp.test(String(value))) {
                            response = entry.text;
                            value = false;
                            break;
                        }
                    }
                } else if (common?.type === 'number') {
                    const m = String(value).match(/(\d+[.,]?\d*)/);
                    if (m) {
                        value = parseFloat(m[1]);
                    }
                    response = value;
                }

                adapter.setForeignState(id, value, err => {
                    if (err) {
                        adapter.log.error(err.toString());
                        void adapter.setState('error', err.toString(), true);
                        sayError(lang, err.toString(), args, ack, cb);
                    } else {
                        let tText = response.toString();
                        // read settings from systemConfig
                        if (systemConfig.isFloatComma && tText === parseFloat(tText).toString()) {
                            tText = tText.replace('.', ',');
                        }

                        cb(
                            getRandomPhrase(ack)
                                .replace('%s', tText)
                                .replace('%u', units)
                                .replace('%n', getObjectName(lang, obj)),
                        );
                    }
                });
            } else {
                adapter.log.warn(`Object "${id}" does not exist!`);
                cb('');
            }
        });
    });
}

/** Only for tests */
export const _extractBinding = extractBinding;
