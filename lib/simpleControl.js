var simpleAnswers = require(__dirname + '/simpleAnswers');
var adapter;
var systemConfig;
var yes = [
    'true',
    'active',
    'ja',
    'aktiv',
    'да',
    'активно',
    'активна',
    'активный'
];
var no = [
    'false',
    'inactive',
    'nein',
    'inaktive',
    'нет',
    'неактивно',
    'неактивна',
    'неактивный'
];

function init(_systemConfig, _adapter) {
    adapter      = _adapter;
    systemConfig = _systemConfig
}

var rusHours = [
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
var rusMinutes = [
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
    'пятдесятпятдесят минут',
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
function sayTime(lang, text, args, ack, cb) {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();

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
        cb(simpleAnswers.getRandomPhrase(ack));
    } else {
        simpleAnswers.sayNoName(lang, text, args, ack, cb);
    }
}

function sayTemperature(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.getForeignObject(args[0], function (err, obj) {
        if (!obj) {
            return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
        }

        adapter.getForeignState(args[0], function (err, state) {
            if (!state || state.val === null || state.val === undefined) {
                return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
            }
            ack = simpleAnswers.getRandomPhrase(ack);

            // replace , with . | convert to float and round to integer
            var t = Math.round(parseFloat(state.val.toString().replace('&deg;', '').replace(',', '.')));
            var u = (obj.common ? obj.common.unit : systemConfig.tempUnit) || systemConfig.tempUnit;
            u = u || '°C';

            if (!ack) {
                if (lang == 'ru') ack = 'Температура %s %u';
                if (lang == 'de') ack = 'Temperature ist %s %u';
                if (lang == 'en') ack = 'Temperature is %s %u';
            }

            if (!ack) {
                adapter.log.error('Language ' + lang + ' is not supported');
                cb();
                return;
            }

            // normally people know what the units are used
            if (u == '°C') {
                /*if (lang == 'ru') u = 'целсия';
                if (lang == 'de') u = 'Celsius';
                if (lang == 'en') u = 'celsius';*/
                u = '';
            } else
            if (u == '°F') {
                /*if (lang == 'ru') u = 'по фаренгейту';
                if (lang == 'de') u = 'Fahrenheit';
                if (lang == 'en') u = 'fahrenheit';*/
                u = '';
            }

            if (lang == 'ru') {
                // get last digit
                var tr = t % 10;
                if (tr == 1) {
                    cb(ack.replace('%s', 'один').replace('%u', 'градус ' + u).replace('%n', obj.common ? obj.common.name : ''));
                }
                else
                if (tr >= 2 && tr <= 4) {
                    cb(ack.replace('%s', t).replace('%u', 'градуса ' + u).replace('%n', obj.common ? obj.common.name : ''));
                }
                else {
                    cb(ack.replace('%s', t).replace('%u', 'градусов').replace('%n', obj.common ? obj.common.name : ''));
                }
            }
            else if (lang == 'de') {
                cb(ack.replace('%s', t).replace('%u', 'Grad').replace('%n', obj.common ? obj.common.name : ''));
            }
            else if (lang == 'en') {
                if (t == 1) {
                    cb(ack.replace('%s', t).replace('%u', 'degree ' + u).replace('%n', obj.common ? obj.common.name : ''));
                } else {
                    cb(ack.replace('%s', t).replace('%u', 'degrees').replace('%n', obj.common ? obj.common.name : ''));
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
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Control ID ' + args[0] + ' with : ' + args[1]);

    if (typeof args[1] === 'string' && args[1] !== '') {
        // try to parse "{val: 5, ack: true}"
        if (args[1][0] === '{') {
            var oobb;
            try {
                oobb = JSON.parse(args[1]);
            } catch (e) {
                // ignore it
            }
            if (oobb && oobb.val !== undefined) {
                args[1] = oobb;
            }
        }
        if (typeof args[1] === 'string') {
            if (args[1] === 'true')  args[1] = true;
            if (args[1] === 'false') args[1] = false;
            var f = parseFloat(args[1]);
            if (f.toString() == args[1]) args[1] = f;
        }
    }

    // Find any numberinput = "einschalten auf -20%"
    var m = text ? text.match(/([-+]\d+[.,]?\d*)\b/) : null;
    if (!m) m = text ? text.match(/\b(\d+[.,]?\d*)\b/) : null;
    if (m) args[1] = parseFloat(m[1].replace(',', '.'));

    adapter.getForeignObject(args[0], function (err, obj) {
        if (err) adapter.log.warn(err);
        if (obj) {
            if (obj.common) {
                if (obj.common.write === false) {
                    adapter.log.error('Cannot control read only "' + args[0] + '"');
                    return simpleAnswers.sayError(lang, 'Cannot control read only "' + args[0] + '"', args, ack, cb);
                }

                if (obj.common.type === 'number' || (obj.common.role && obj.common.role.indexOf('level') != -1)) {
                    if (args[1] === true)  args[1] = 1;
                    if (args[1] === false) args[1] = 0;
                } else if (obj.common.type === 'boolean' || (obj.common.role && obj.common.role.indexOf('switch') != -1)) {
                    args[1] = !!args[1];
                }
            }
            var units = '';
            if (obj.common) {
                units = obj.common.unit;
            }
            adapter.log.debug('userDeviceControl into "' + args[0] + '": ' + args[1]);
            adapter.setForeignState(args[0], args[1], function (err) {
                if (err) {
                    adapter.log.error(err);
                    simpleAnswers.sayError(lang, err, args, ack, cb);
                } else if (ack) {
                    cb(simpleAnswers.getRandomPhrase(ack).replace('%s', args[1]).replace('%u', units).replace('%n', obj.common ? obj.common.name : ''));
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
        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
    }
    adapter.log.info('Say ID ' + args[0]);

    adapter.getForeignObject(args[0], function (err, obj) {
        if (err) adapter.log.warn(err);
        if (obj) {
            adapter.getForeignState(args[0], function (err, state) {
                if (err) {
                    adapter.log.error(err);
                    simpleAnswers.sayError(lang, err, args, ack, cb);
                } else {
                    if (!state || state.val === null || state.val === undefined) {
                        return simpleAnswers.sayIDontKnow(lang, text, args, ack, cb);
                    }

                    if (state.val === 'true' || state.val === true) {
                        if (lang == 'ru') state.val = ' да';
                        if (lang == 'de') state.val = ' ja';
                        if (lang == 'en') state.val = ' yes';
                    } else
                    if (state.val === 'false' || state.val === false) {
                        if (lang == 'ru') state.val = ' нет';
                        if (lang == 'de') state.val = ' nein';
                        if (lang == 'en') state.val = ' no';
                    }
                    var units = '';
                    if (obj.common) units = obj.common.unit;

                    if (units == '°C' || units == '°F') {
                        state.val = Math.round(state.val * 10) / 10;

                        if (lang == 'ru') units = (state.val == 1) ? 'градус' : 'градусов';
                        if (lang == 'de') units = 'Grad';
                        if (lang == 'en') units = (state.val == 1) ? 'degree' : 'degrees';
                    }

                    cb(simpleAnswers.getRandomPhrase(ack).replace('%s', state.val.toString()).replace('%u', units).replace('%n', obj.common ? obj.common.name : ''));
                }
            });

        } else {
            adapter.log.warn('Object "' + args[0] + '" does not exist!');
            cb('');
        }
    });
}

function extractText(text, originalText, words) {
    if (typeof words === 'string') {
        words = words.split(' ');
    }
    var max = 0;
    for (var w = 0; w < words.length; w++) {
        var parts = words[w].split('/');
        for (var p = 0; p < parts.length; p++) {
            if (parts[p][0] === '[') parts[p] = parts[p].substring(1);
            if (parts[p][parts[p].length - 1] === ']') parts[p] = parts[p].substring(0, parts[p].length - 1);
            var pos = text.indexOf(parts[p]);
            if (pos !== -1 && pos + parts[p].length > max) max = pos + parts[p].length;
        }
    }
    // find end of word
    while (max < text.length && text[max] != ' ') {
        max++;
    }
    // skip space
    max++;
    return originalText.substring(max);
}

function sendText(lang, text, args, ack, cb) {
    if (!args || !args[0]) {
        return simpleAnswers.sayNothingToDo(lang, text, args, ack, cb);
    }

    if (args[1]) text = args[1].replace('%s', text);

    adapter.log.info('Say ID ' + args[0] + ': ' + text);

    adapter.getForeignObject(args[0], function (err, obj) {
        if (err) adapter.log.warn(err);
        if (obj) {
            var units = '';
            if (obj.common) units = obj.common.unit;
            var response = text;
            if (obj.common && obj.common.type === 'boolean') {
                for (var i = 0; i < yes.length; i++) {
                    if (typeof yes[i] !== 'object') yes[i] = {regexp: new RegExp('\\b' + yes[i] + '\\b', 'i'), text: yes[i]};
                    if (yes[i].regexp.test(text)) {
                        response = yes[i].text;
                        text = true;
                        break;
                    }
                }
                for (i = 0; i < no.length; i++) {
                    if (typeof no[i] !== 'object') no[i] = {regexp: new RegExp('\\b' + no[i] + '\\b', 'i'), text: no[i]};
                    if (no[i].regexp.test(text)) {
                        response = no[i].text;
                        text = false;
                        break;
                    }
                }
            } else if (obj.common && obj.common.type === 'number') {
                var m = text.match(/(\d+[\.,]?\d*)/);
                if (m) text = parseFloat(m[1]);
                response = text;
            }

            adapter.setForeignState(args[0], text, function (err) {
                if (err) {
                    adapter.log.error(err);
                    simpleAnswers.sayError(lang, err, args, ack, cb);
                } else {
                    cb(simpleAnswers.getRandomPhrase(ack).replace('%s', response.toString()).replace('%u', units).replace('%n', obj.common ? obj.common.name : ''));
                }
            });

        } else {
            adapter.log.warn('Object "' + args[0] + '" does not exist!');
            cb('');
        }
    });
}

module.exports = {
    userQuery:          userQuery,
    userDeviceControl:  userDeviceControl,
    sayTemperature:     sayTemperature,
    sayName:            sayName,
    sayTime:            sayTime,
    extractText:        extractText,
    sendText:           sendText,
    init:               init
};