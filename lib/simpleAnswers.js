/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

//noinspection JSUnresolvedVariable
const functionsGenitive = require('./functions').functionsGenitive;
//noinspection JSUnresolvedVariable
const roomsDative = require('./rooms').roomsDative;

function getRandomPhrase(arrOrText) {
    if (typeof arrOrText === 'string') {
        arrOrText = arrOrText.split('/');
    }

    if (typeof arrOrText === 'object') {
        if (arrOrText.length > 1) {
            let randomNumber = Math.floor(Math.random() * arrOrText.length);
            if (randomNumber > arrOrText.length - 1) {
                randomNumber = arrOrText.length - 1;
            }
            return arrOrText[randomNumber];
        } else {
            return arrOrText[0];
        }
    } else {
        return arrOrText.toString();
    }
}

//noinspection JSUnusedLocalSymbols
function sayIDontKnow(lang, text, args, ack, cb) {
    let toSay;
    if (lang === 'ru') {
        toSay = getRandomPhrase(['Извините, но ', 'Прошу прощения, но ', ""]) +
            getRandomPhrase(['Я не знаю', 'Нет данных']);
    }
    else if (lang === 'de') {
        toSay = getRandomPhrase(['Entschuldigen sie. ', 'Es tut mir leid. ', ""]) +
            getRandomPhrase(['Ich weiss nicht', 'Keine Daten vorhanden']);
    }
    else if (lang === 'en') {
        toSay = getRandomPhrase(['I am sorry, but ', 'Excuse me. ', ""]) +
            getRandomPhrase(['I don\'t know', 'No data available']);
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayNoName(lang, text, args, ack, cb) {
    let toSay;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        toSay = 'Обращайся ко мне как хочешь. У меня нет имени';
    }
    else if (lang === 'de') {
        toSay = 'Nenne mich wie du willst. Ich habe keinen Namen.';
    }
    else if (lang === 'en') {
        toSay = 'Call me as you wish. I don\'t have a name';
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayIDontUnderstand(lang, text, args, ack, cb) {
    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        if (!text) {
            toSay = 'Я не поняла команду';
        }
        else {
            toSay = `Я поняла только "${text}"`;
        }
    }
    else if (lang === 'de') {
        if (!text) {
            toSay = 'Ich habe nichts verstanden';
        }
        else{
            toSay = `Ich verstehe "${text}" nicht`;
        }
    }
    else if (lang === 'en') {
        if (!text) {
            toSay = 'I could not understand you';
        }
        else{
            toSay = `I don't understand. I could only hear "${text}"`;
        }
    }

    cb(toSay);
}

//noinspection JSUnusedLocalSymbols
function sayNoSuchRoom(lang, text, args, ack, cb) {
    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase(['Room not present', 'Room not found', 'You don\'t have such a room']);
    } else
    if (lang === 'de') {
        toSay = getRandomPhrase(['Raum wurde nicht gefunden', 'Es gibt kein Zimmer mit dem Namen', 'Man muss sagen in welchem Raum oder überall']);
    } else
    if (lang === 'ru') {
        toSay = getRandomPhrase(['Комната не найдена', 'Надо сказать в какой комнате или сказать везде']);
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayNothingToDo(lang, text, args, ack, cb) {
    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase(['I don\'t know, what to do', 'No action defined']);
    } else
    if (lang === 'de') {
        toSay = getRandomPhrase(['Ich weiß nicht, was ich machen soll', 'Aktion ist nicht definiert']);
    } else
    if (lang === 'ru') {
        toSay = getRandomPhrase(['Непонятно, что делать', 'Не задано действие']);
    } else {
        toSay = "";
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayNoSuchFunction(lang, text, args, ack, cb) {
    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase('Function not present/Function not found/You don\'t have such a device');
    } else
    if (lang === 'de') {
        toSay = getRandomPhrase('Die Funktion wurde nicht gefunden/Es gibt keine Funktion mit dem Namen/Man muss sagen womit man was machen will');
    } else
    if (lang === 'ru') {
        toSay = getRandomPhrase('Устройство не найдено/Надо сказать с чем произвести действие');
    } else {
        toSay = "";
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayNoFunctionInThisRoom(lang, text, args, ack, cb) {
    let sRoom     = args[0];
    let sFunction = args[1];

    let toSay;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (functionsGenitive[sFunction] && roomsDative[sRoom] && lang === 'en') {
        toSay = `There is no ${functionsGenitive[sFunction][lang]} ${roomsDative[sRoom][lang]}`;
    } else if (functionsGenitive[sFunction] && roomsDative[sRoom] && lang === 'de') {
        toSay = `Es gibt kein ${functionsGenitive[sFunction][lang]} ${roomsDative[sRoom][lang]}`;
    } else if (functionsGenitive[sFunction] && roomsDative[sRoom] && lang === 'ru') {
        toSay = `${roomsDative[sRoom][lang]} нет ${functionsGenitive[sFunction][lang]}`;
    } else {
        toSay = '';
    }
    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

//noinspection JSUnusedLocalSymbols
function sayError(lang, text, args, ack, cb) {
    let toSay;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase('Error. See logs.');
    } else
    if (lang === 'de') {
        toSay = getRandomPhrase('Fehler. Sehe Logs.');
    } else
    if (lang === 'ru') {
        toSay = getRandomPhrase('Ошибка. Смотрите логи.');
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

module.exports = {
    getRandomPhrase,
    sayIDontKnow,
    sayNoName,
    sayIDontUnderstand,
    sayNoSuchRoom,
    sayNoSuchFunction,
    sayNothingToDo,
    sayError,
    sayNoFunctionInThisRoom,
};