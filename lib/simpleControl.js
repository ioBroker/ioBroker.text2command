/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

const simpleAnswers = require(__dirname + '/simpleAnswers');
const formatProvider= require(__dirname + '/formatProvider'); // todo use formatProvider from js-controller/lib, if implemented
const yes = [
    'true',
    'active',
    'ja',
    'aktiv',
    'да',
    'активно',
    'активна',
    'активный'
];
const no = [
    'false',
    'inactive',
    'nein',
    'inaktiv',
    'нет',
    'неактивно',
    'неактивна',
    'неактивный'
];

let adapter;
let systemConfig;

function init(_systemConfig, _adapter) {
    adapter      = _adapter;
    systemConfig = _systemConfig
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
    'двадцать четыре часа'
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
    'пятдесят минут',
    'пятдесят одна минута',
    'пятдесят две минуты',
    'пятдесят три минуты',
    'пятдесят четыре минуты',
    'пятдесят пять минут',
    'пятдесят шесть минут',
    'пятдесят семь минут',
    'пятдесят восемь минут',
    'пятдесят девять минут',
    'шестьдесят минут'
];

function getObjectName(lang, obj) {
    if (!obj || !obj.common || !obj.common.name) return '';
    if (typeof obj.common.name === 'object') {
        return obj.common.name[lang] || obj.common.name.en;
    } else {
        return obj.common.name;
    }
}

//noinspection JSUnusedLocalSymbols
function sayTime(lang, text, args, ack, cb) {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();

    if (lang === 'ru') {
        cb(rusHours[h] + ' ' + rusMinutes[m]);
        return;
    }
    if (h < 10) h = '0' + '' + h;
    if (m < 10) m = '0' + '' + m;

    cb(h + ':' + m);
}

function sayName(lang, text, args, ack, cb) {
    if (ack) {
        //noinspection JSUnresolvedFunction
        cb(simpleAnswers.getRandomPhrase(ack));
    } else {
        //noinspection JSUnresolvedFunction
        simpleAnswers.sayNoName(lang, text, args, ack, cb);
    }
}

function sayTemperature(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        //noinspection JSUnresolvedFunction
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    //noinspection JSUnresolvedFunction
    adapter.getForeignObject(args[0], (err, obj) => {
        if (!obj) {
            //noinspection JSUnresolvedFunction
            return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
        }

        //noinspection JSUnresolvedFunction
        adapter.getForeignState(args[0], (err, state) => {
            //noinspection JSUnresolvedVariable
            if (!state || state.val === null || state.val === undefined) {
                //noinspection JSUnresolvedFunction
                return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
            }
            //noinspection JSUnresolvedFunction
            ack = simpleAnswers.getRandomPhrase(ack);

            // replace , with . | convert to float and round to integer
            //noinspection JSUnresolvedVariable
            let t = Math.round(parseFloat(state.val.toString().replace('&deg;', '').replace(',', '.')));
            //noinspection JSUnresolvedVariable
            let u = (obj.common && obj.common.unit) || systemConfig.tempUnit;
            u = u || '°C';

            if (!ack) {
                if (lang === 'ru') ack = 'Температура %s %u';
                if (lang === 'de') ack = 'Temperatur ist %s %u';
                if (lang === 'en') ack = 'Temperature is %s %u';
            }

            if (!ack) {
                adapter.log.error('Language ' + lang + ' is not supported');
                cb();
                return;
            }

            // normally people know what the units are used
            if (u === '°C') {
                /*if (lang === 'ru') u = 'цельсия';
                if (lang === 'de') u = 'Celsius';
                if (lang === 'en') u = 'celsius';*/
                u = '';
            } else
            if (u === '°F') {
                /*if (lang === 'ru') u = 'по фаренгейту';
                if (lang === 'de') u = 'Fahrenheit';
                if (lang === 'en') u = 'fahrenheit';*/
                u = '';
            }

            parseTemplates(lang, ack, (err, ack) => {
                if (lang === 'ru') {
                    // get last digit
                    let tr = t % 10;
                    let tc = ~~(t / 10);
                    if (t === 1) {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', 'один').replace('%u', 'градус ' + u).replace('%n', getObjectName(lang, obj)));
                    }
                    else
                    if (tc === 1 && tr >= 1 && tr <= 4){
                        cb(ack.replace('%s', t).replace('%u', 'градусов').replace('%n', getObjectName(lang, obj)));
                    }
                    else
                    if (tr === 1) {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', t).replace('%u', 'градус ' + u).replace('%n', getObjectName(lang, obj)));
                    }
                    else
                    if (tr >= 2 && tr <= 4) {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', t).replace('%u', 'градуса ' + u).replace('%n', getObjectName(lang, obj)));
                    }
                    else {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', t).replace('%u', 'градусов').replace('%n', getObjectName(lang, obj)));
                    }
                }
                else if (lang === 'de') {
                    //noinspection JSUnresolvedVariable
                    cb(ack.replace('%s', t).replace('%u', 'Grad').replace('%n', getObjectName(lang, obj)));
                }
                else if (lang === 'en') {
                    if (t === 1) {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', t).replace('%u', 'degree ' + u).replace('%n', getObjectName(lang, obj)));
                    } else {
                        //noinspection JSUnresolvedVariable
                        cb(ack.replace('%s', t).replace('%u', 'degrees').replace('%n', getObjectName(lang, obj)));
                    }
                }
                else {
                    adapter.log.error('Language ' + lang + ' is not supported');
                    cb();
                }
            });
        });
    });
}

function userDeviceControl(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        //noinspection JSUnresolvedFunction
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Control ID ' + args[0] + ' with : ' + args[1]);

    if (typeof args[1] === 'string' && args[1] !== '') {
        // try to parse "{val: 5, ack: true}"
        if (args[1][0] === '{') {
            let oobb;
            try {
                oobb = JSON.parse(args[1]);
            } catch (e) {
                // ignore it
            }
            //noinspection JSUnresolvedVariable
            if (oobb && oobb.val !== undefined) {
                args[1] = oobb;
            }
        }
        if (typeof args[1] === 'string') {
            if (args[1] === 'true')  args[1] = true;
            if (args[1] === 'false') args[1] = false;
            let f = parseFloat(args[1]);
            if (f.toString() === args[1]) args[1] = f;
        }
    }

    // Find any numberinput = "einschalten auf -20%"
    let m = text ? text.match(/([-+]\d+[.,]?\d*)\b/) : null;
    if (!m) m = text ? text.match(/\b(\d+[.,]?\d*)\b/) : null;
    if (m) args[1] = parseFloat(m[1].replace(',', '.'));

    //noinspection JSUnresolvedFunction
    adapter.getForeignObject(args[0], (err, obj) => {
        if (err) adapter.log.warn(err);
        if (obj) {
            //noinspection JSUnresolvedVariable
            if (obj.common) {
                //noinspection JSUnresolvedVariable
                if (obj.common.write === false) {
                    adapter.log.error('Cannot control read only "' + args[0] + '"');
                    if (lang === 'de') {
                        adapter.setState('error', 'Kann die Read-only-Variable "' + args[0] + '" nicht steuern', true);
                    } else if (lang === 'ru') {
                        adapter.setState('error', 'Нельзя конторолировать объект "' + args[0] + '" только для чтения', true);
                    } else {
                        adapter.setState('error', 'Cannot control read only "' + args[0] + '"', true);
                    }
                    //noinspection JSUnresolvedFunction
                    return simpleAnswers.sayError(lang, 'Cannot control read only "' + args[0] + '"', args, ack, cb);
                }

                //noinspection JSUnresolvedVariable
                if (obj.common.type === 'number' || (obj.common.role && obj.common.role.indexOf('level') !== -1)) {
                    if (args[1] === true)  args[1] = 1;
                    if (args[1] === false) args[1] = 0;
                } else
                //noinspection JSUnresolvedVariable
                if (obj.common.type === 'boolean' || (obj.common.role && obj.common.role.indexOf('switch') !== -1)) {
                    args[1] = !!args[1];
                }
            }
            let units = '';
            //noinspection JSUnresolvedVariable
            if (obj.common) {
                //noinspection JSUnresolvedVariable
                units = obj.common.unit || '';
            }
            adapter.log.debug('userDeviceControl into "' + args[0] + '": ' + args[1]);
            //noinspection JSUnresolvedFunction
            adapter.setForeignState(args[0], args[1], function (err) {
                if (err) {
                    adapter.log.error(err);
                    adapter.setState('error', err, true);
                    //noinspection JSUnresolvedFunction
                    simpleAnswers.sayError(lang, err, args, ack, cb);
                } else if (ack) {
                    parseTemplates(lang, ack, (err, ack) => {
                        //noinspection JSUnresolvedFunction, JSUnresolvedVariable
                        cb(simpleAnswers.getRandomPhrase(ack).replace('%s', args[1]).replace('%u', units).replace('%n', getObjectName(lang, obj)));
                    });
                } else {
                    cb();
                }
            });
        } else {
            adapter.log.warn('Object "' + args[0] + '" does not exist!');
            cb('');
        }
    });
}

function userQuery(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        //noinspection JSUnresolvedFunction
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Say ID ' + args[0]);

    //noinspection JSUnresolvedFunction
    adapter.getForeignObject(args[0], (err, obj) => {
        if (err) adapter.log.warn(err);
        if (obj) {
            //noinspection JSUnresolvedFunction
            adapter.getForeignState(args[0], (err, state) => {
                if (err) {
                    adapter.log.error(err);
                    adapter.setState('error', err, true);
                    //noinspection JSUnresolvedFunction
                    simpleAnswers.sayError(lang, err, args, ack, cb);
                } else {
                    //noinspection JSUnresolvedVariable
                    if (!state || state.val === null || state.val === undefined) {
                        //noinspection JSUnresolvedFunction
                        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
                    }

                    //noinspection JSUnresolvedVariable
                    if (state.val === 'true' || state.val === true) {
                        if (lang === 'ru') state.val = ' да';
                        if (lang === 'de') state.val = ' ja';
                        if (lang === 'en') state.val = ' yes';
                    } else
                    //noinspection JSUnresolvedVariable
                    if (state.val === 'false' || state.val === false) {
                        if (lang === 'ru') state.val = ' нет';
                        if (lang === 'de') state.val = ' nein';
                        if (lang === 'en') state.val = ' no';
                    }
                    let units = '';
                    //noinspection JSUnresolvedVariable
                    if (obj.common) {
                        //noinspection JSUnresolvedVariable
                        units = obj.common.unit || '';
                    }

                    if (units === '°C' || units === '°F') {
                        //noinspection JSUnresolvedVariable
                        state.val = Math.round(state.val * 10) / 10;

                        if (lang === 'ru') {
                            //noinspection JSUnresolvedVariable
                            units = (state.val == 1) ? 'градус' : 'градусов';
                        }
                        if (lang === 'de') units = 'Grad';
                        if (lang === 'en') {
                            //noinspection JSUnresolvedVariable
                            units = (state.val == 1) ? 'degree' : 'degrees';
                        }
                    }

                    parseTemplates(lang, ack, (err, ack) => {
                        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                        cb(simpleAnswers.getRandomPhrase(ack).replace('%s', state.val.toString()).replace('%u', units).replace('%n', getObjectName(lang, obj)));
                    });
                }
            });
        } else {
            adapter.log.warn('Object "' + args[0] + '" does not exist!');
            cb('');
        }
    });
}

function buildAnswer(lang, text, args, ack, cb) {
    parseTemplates(lang, ack, (err, ack) => {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        cb(simpleAnswers.getRandomPhrase(ack));
    });
}

function extractText(text, originalText, words) {
    if (typeof words === 'string') {
        words = words.split(' ');
    }
    if (!Array.isArray(words)) {
        adapter.log.error('Invalid Rule definition: ' + JSON.stringify(words));
        return originalText;
    }
    adapter.log.debug('Words: ' + JSON.stringify(words));
    let max = 0;
    for (let w = 0; w < words.length; w++) {
        let parts;
        if (words[w] instanceof Array) {
            parts = words[w];
        } else {
            parts = (words[w] || '').toString().split('/');
        }
        for (let p = 0; p < parts.length; p++) {
            if (parts[p][0] === '[') parts[p] = parts[p].substring(1);
            if (parts[p][parts[p].length - 1] === ']') parts[p] = parts[p].substring(0, parts[p].length - 1);
            let pos = text.indexOf(parts[p]);
            if (pos !== -1 && pos + parts[p].length > max) max = pos + parts[p].length;
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

function extractBinding(format) {
    const oid = format.match(/{(.+?)}/g);
    let result = null;
    if (oid) {
        if (oid.length > 50) {
            console.warn('Too many bindings in one widget: ' + oid.length + '[max = 50]');
        }
        for (let p = 0; p < oid.length && p < 50; p++) {
            let _oid = oid[p].substring(1, oid[p].length - 1);
            if (_oid[0] === '{') continue;
            // If first symbol '"' => it is JSON
            if (_oid && _oid[0] === '"') continue;
            let parts = _oid.split(';');
            result = result || [];
            let systemOid = parts[0].trim();
            let visOid = systemOid;

            let test1 = visOid.substring(visOid.length - 4);
            let test2 = visOid.substring(visOid.length - 3);

            if (visOid && test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                visOid = visOid + '.val';
            }

            let isSeconds = (test2 === '.ts' || test2 === '.lc');
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
            let operations = null;
            let isEval = visOid.match(/[\d\w_.]+:\s?[-\d\w_.]+/) || (!visOid.length && parts.length > 0);//(visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);

            if (isEval) {
                let xx = visOid.split(':', 2);
                let yy = systemOid.split(':', 2);
                visOid = xx[1];
                systemOid = yy[1];
                operations = operations || [];
                operations.push({
                    op: 'eval',
                    arg: [{
                        name: xx[0],
                        visOid: visOid,
                        systemOid: systemOid
                    }]
                });
            }

            for (let u = 1; u < parts.length; u++) {
                // eval construction
                if (isEval) {
                    if (parts[u].trim().match(/^[\d\w_.]+:\s?[-.\d\w_]+$/)) {//parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
                        let _systemOid = parts[u].trim();
                        let _visOid = _systemOid;

                        test1 = _visOid.substring(_visOid.length - 4);
                        test2 = _visOid.substring(_visOid.length - 3);

                        if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                            _visOid = _visOid + '.val';
                        }

                        test1 = systemOid.substring(_systemOid.length - 4);
                        test2 = systemOid.substring(_systemOid.length - 3);

                        if (test1 === '.val' || test1 === '.ack') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                        } else if (test2 === '.lc' || test2 === '.ts') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                        }
                        let x1 = _visOid.split(':', 2);
                        let y1 = _systemOid.split(':', 2);

                        operations[0].arg.push({
                            name:      x1[0],
                            visOid:    x1[1],
                            systemOid: y1[1]
                        });
                    } else {
                        parts[u] = parts[u].replace(/::/g, ':');
                        if (operations[0].formula) {
                            let n = JSON.parse(JSON.stringify(operations[0]));
                            n.formula = parts[u];
                            operations.push(n);
                        } else {
                            operations[0].formula = parts[u];
                        }
                    }
                } else {
                    let parse = parts[u].match(/([\w\s\/+*-]+)(\(.+\))?/);
                    if (parse && parse[1]) {
                        parse[1] = parse[1].trim();
                        // operators requires parameter
                        if (parse[1] === '*' ||
                            parse[1] === '+' ||
                            parse[1] === '-' ||
                            parse[1] === '/' ||
                            parse[1] === '%' ||
                            parse[1] === 'min' ||
                            parse[1] === 'max') {
                            if (parse[2] === undefined) {
                                console.log('Invalid format of format string: ' + format);
                                parse[2] = null;
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log('Invalid format of format string: ' + format);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({op: parse[1], arg: parse[2]});
                                }
                            }
                        } else
                        // date formatting
                        if (parse[1] === 'date' || parse[1] === 'dateinterval') {
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({op: parse[1], arg: parse[2]});
                        } else
                        // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                        if (parse[1] === 'array') {
                            operations = operations || [];
                            let param = (parse[2] || '').trim();
                            param = param.substring(1, param.length - 1);
                            param = param.split(',');
                            if (Array.isArray(param)) {
                                operations.push ({op: parse[1], arg: param}); //xxx
                            }
                        } else
                        // value formatting
                        if (parse[1] === 'value') {
                            operations = operations || [];
                            let param = (parse[2] === undefined) ? '(2)' : (parse[2] || '');
                            param = param.trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({op: parse[1], arg: param});
                        } else
                        // operators have optional parameter
                        if (parse[1] === 'pow' || parse[1] === 'round' || parse[1] === 'random') {
                            if (parse[2] === undefined) {
                                operations = operations || [];
                                operations.push({op: parse[1]});
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log('Invalid format of format string: ' + format);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({op: parse[1], arg: parse[2]});
                                }
                            }
                        } else
                        // operators without parameter
                        {
                            operations = operations || [];
                            operations.push({op: parse[1]});
                        }
                    } else {
                        console.log('Invalid format ' + format);
                    }
                }
            }

            result.push({
                visOid: visOid,
                systemOid: systemOid,
                token: oid[p],
                operations: operations ? operations : undefined,
                format: format,
                isSeconds: isSeconds,
                attr: attr
            });
        }
    }
    return result;
}

function parseTemplates(lang, format, cb){
    let oids= extractBinding(format);
    
    if (!oids) {
        return cb(null, format);
    }
    let _values = {length:oids.length};

    for (let t = 0; t < oids.length; t++) {
        if (oids[t].visOid && _values[oids[t].visOid] === undefined) {
            adapter.getForeignState(oids[t].systemOid, (err, state) => {
                _values[oids[t].visOid] = state ? state[oids[t].attr || 'val'] : '';
                if (_values[oids[t].visOid] === undefined || _values[oids[t].visOid] === null) {
                    _values[oids[t].visOid] = ''
                }
                _values.length--;
                if (_values.length == 0)
                    setImmediate(executeTemplates, lang, format, cb, _values, oids);
            });
        } else{
            _values.length--;
            if (_values.length == 0)
                executeTemplates(lang, format, cb, _values, oids);
        }
    }
}

function executeTemplates(lang, format, cb, _values, oids) {
    for (let t = 0; t < oids.length; t++) {
        let value = _values[oids[t].visOid];
        if (oids[t].operations) {
            for (let k = 0; k < oids[t].operations.length; k++) {
                switch (oids[t].operations[k].op) {
                    case 'eval':
                        let string = '';//'(function() {';
                        for (let a = 0; a < oids[t].operations[k].arg.length; a++) {
                            if (!oids[t].operations[k].arg[a].name) continue;
                            value = _values[oids[t].operations[k].arg[a].visOid];
                            string += 'var ' + oids[t].operations[k].arg[a].name + ' = "' + value + '";';
                        }
                        let formula = oids[t].operations[k].formula;
                        string += 'return ' + oids[t].operations[k].formula + ';';
                        //string += '}())';
                        try {
                            value = new Function(string)();
                        } catch (e) {
                            console.error('Error in eval[value]     : ' + format);
                            console.error('Error in eval[script]: ' + string);
                            console.error('Error in eval[error] : ' + e);
                            value = 0;
                        }
                        break;
                    case '*':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) * oids[t].operations[k].arg;
                        }
                        break;
                    case '/':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) / oids[t].operations[k].arg;
                        }
                        break;
                    case '+':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) + oids[t].operations[k].arg;
                        }
                        break;
                    case '-':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) - oids[t].operations[k].arg;
                        }
                        break;
                    case '%':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) % oids[t].operations[k].arg;
                        }
                        break;
                    case 'round':
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.round(parseFloat(value));
                        } else {
                            value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                        }
                        break;
                    case 'pow':
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.pow(parseFloat(value), 2);
                        } else {
                            value = Math.pow(parseFloat(value), oids[t].operations[k].arg);
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
                        if (value.length < 2) value = '0' + value;
                        break;
                    case 'HEX':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        break;
                    case 'HEX2':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        if (value.length < 2) value = '0' + value;
                        break;
                    case 'value':
                        value = adapter.formatValue(value, parseInt(oids[t].operations[k].arg, 10));
                        break;
                    case 'array':
                        value = oids[t].operations[k].arg [~~value];
                        break;
                    case 'date':
                        value = adapter.formatDate(value, oids[t].operations[k].arg);
                        break;
                    case 'dateinterval':
                        value = formatProvider.formatInterval(value, oids[t].operations[k].arg,lang);
                        break;                        
                    case 'min':
                        value = parseFloat(value);
                        value = (value < oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                        break;
                    case 'max':
                        value = parseFloat(value);
                        value = (value > oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                        break;
                    case 'random':
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.random();
                        } else {
                            value = Math.random() * oids[t].operations[k].arg;
                        }
                        break;
                    case 'floor':
                        value = Math.floor(parseFloat(value));
                        break;
                    case 'ceil':
                        value = Math.ceil(parseFloat(value));
                        break;
                } //switch
            }
        } //if for
        format = format.replace(oids[t].token, value);
    }//for
    format = format.replace(/{{/g, '{').replace(/}}/g, '}');
    cb(null, format);
}

function sendText(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        //noinspection JSUnresolvedFunction
        return simpleAnswers.sayNothingToDo(lang, text, args, ack, cb);
    }

    if (args[1]) text = args[1].replace('%s', text);

    parseTemplates(lang, text, (err, text) => {
        adapter.log.info('Say ID ' + args[0] + ': ' + text);

        //noinspection JSUnresolvedFunction
        adapter.getForeignObject(args[0], function (err, obj) {
            if (err) adapter.log.warn(err);
            if (obj) {
                let units = '';
                //noinspection JSUnresolvedVariable
                if (obj.common) {
                    //noinspection JSUnresolvedVariable
                    units = obj.common.unit || '';
                }
                let response = text;
                //noinspection JSUnresolvedVariable
                if (obj.common && obj.common.type === 'boolean') {
                    for (let i = 0; i < yes.length; i++) {
                        if (typeof yes[i] !== 'object') yes[i] = {regexp: new RegExp('\\b' + yes[i] + '\\b', 'i'), text: yes[i]};
                        if (yes[i].regexp.test(text)) {
                            response = yes[i].text;
                            text = true;
                            break;
                        }
                    }
                    for (let j = 0; j < no.length; j++) {
                        if (typeof no[j] !== 'object') no[j] = {regexp: new RegExp('\\b' + no[j] + '\\b', 'i'), text: no[j]};
                        if (no[j].regexp.test(text)) {
                            response = no[j].text;
                            text = false;
                            break;
                        }
                    }
                } else
                //noinspection JSUnresolvedVariable
                if (obj.common && obj.common.type === 'number') {
                    let m = text.match(/(\d+[.,]?\d*)/);
                    if (m) text = parseFloat(m[1]);
                    response = text;
                }

                //noinspection JSUnresolvedFunction
                adapter.setForeignState(args[0], text, err => {
                    if (err) {
                        adapter.log.error(err);
                        adapter.setState('error', err, true);
                        //noinspection JSUnresolvedFunction
                        simpleAnswers.sayError(lang, err, args, ack, cb);
                    } else {
                        //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                        cb(simpleAnswers.getRandomPhrase(ack).replace('%s', response.toString()).replace('%u', units).replace('%n', getObjectName(lang, obj)));
                    }
                });

            } else {
                adapter.log.warn('Object "' + args[0] + '" does not exist!');
                cb('');
            }
        });
    });
}

module.exports = {
    buildAnswer:        buildAnswer,
    userQuery:          userQuery,
    userDeviceControl:  userDeviceControl,
    sayTemperature:     sayTemperature,
    sayName:            sayName,
    sayTime:            sayTime,
    extractText:        extractText,
    sendText:           sendText,
    init:               init
};
