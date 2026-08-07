import { functionsGenitive } from './functions';
import { roomsDative } from './rooms';
import type { AnswerCallback, RuleAck, RuleArgument } from './types';

/**
 * Take one of the alternatives, which are separated by `/`
 *
 * @param arrOrText text with alternatives separated by `/` or an array of alternatives
 */
export function getRandomPhrase(arrOrText: RuleAck): string {
    if (arrOrText === null || arrOrText === undefined) {
        return '';
    }

    let alternatives: string[];
    if (typeof arrOrText === 'string') {
        alternatives = arrOrText.split('/');
    } else if (Array.isArray(arrOrText)) {
        alternatives = arrOrText;
    } else {
        return arrOrText.toString();
    }

    if (alternatives.length > 1) {
        let randomNumber = Math.floor(Math.random() * alternatives.length);
        if (randomNumber > alternatives.length - 1) {
            randomNumber = alternatives.length - 1;
        }
        return alternatives[randomNumber];
    }

    return alternatives[0] ?? '';
}

export function sayIDontKnow(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string | undefined;
    if (lang === 'ru') {
        toSay =
            getRandomPhrase(['Извините, но ', 'Прошу прощения, но ', '']) +
            getRandomPhrase(['Я не знаю', 'Нет данных']);
    } else if (lang === 'de') {
        toSay =
            getRandomPhrase(['Entschuldigen sie. ', 'Es tut mir leid. ', '']) +
            getRandomPhrase(['Ich weiss nicht', 'Keine Daten vorhanden']);
    } else if (lang === 'en') {
        toSay =
            getRandomPhrase(['I am sorry, but ', 'Excuse me. ', '']) +
            getRandomPhrase(["I don't know", 'No data available']);
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}

export function sayNoName(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string | undefined;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        toSay = 'Обращайся ко мне как хочешь. У меня нет имени';
    } else if (lang === 'de') {
        toSay = 'Nenne mich wie du willst. Ich habe keinen Namen.';
    } else if (lang === 'en') {
        toSay = "Call me as you wish. I don't have a name";
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}

export function sayIDontUnderstand(
    lang: ioBroker.Languages,
    text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb: AnswerCallback,
): void {
    let toSay: string | undefined;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'ru') {
        if (!text) {
            toSay = 'Я не поняла команду';
        } else {
            toSay = `Я поняла только "${text}"`;
        }
    } else if (lang === 'de') {
        if (!text) {
            toSay = 'Ich habe nichts verstanden';
        } else {
            toSay = `Ich verstehe "${text}" nicht`;
        }
    } else if (lang === 'en') {
        if (!text) {
            toSay = 'I could not understand you';
        } else {
            toSay = `I don't understand. I could only hear "${text}"`;
        }
    }

    cb(toSay);
}

export function sayNoSuchRoom(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase(['Room not present', 'Room not found', "You don't have such a room"]);
    } else if (lang === 'de') {
        toSay = getRandomPhrase([
            'Raum wurde nicht gefunden',
            'Es gibt kein Zimmer mit dem Namen',
            'Man muss sagen in welchem Raum oder überall',
        ]);
    } else if (lang === 'ru') {
        toSay = getRandomPhrase(['Комната не найдена', 'Надо сказать в какой комнате или сказать везде']);
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}

export function sayNothingToDo(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase(["I don't know, what to do", 'No action defined']);
    } else if (lang === 'de') {
        toSay = getRandomPhrase(['Ich weiß nicht, was ich machen soll', 'Aktion ist nicht definiert']);
    } else if (lang === 'ru') {
        toSay = getRandomPhrase(['Непонятно, что делать', 'Не задано действие']);
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}

export function sayNoSuchFunction(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase("Function not present/Function not found/You don't have such a device");
    } else if (lang === 'de') {
        toSay = getRandomPhrase(
            'Die Funktion wurde nicht gefunden/Es gibt keine Funktion mit dem Namen/Man muss sagen womit man was machen will',
        );
    } else if (lang === 'ru') {
        toSay = getRandomPhrase('Устройство не найдено/Надо сказать с чем произвести действие');
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}

export function sayNoFunctionInThisRoom(
    lang: ioBroker.Languages,
    _text: string,
    args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    const sRoom = (args?.[0] as string) || '';
    const sFunction = (args?.[1] as string) || '';

    let toSay: string;
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
        return undefined;
    }
    return toSay;
}

export function sayError(
    lang: ioBroker.Languages,
    _text: string,
    _args: RuleArgument[] | null | undefined,
    _ack: RuleAck,
    cb?: AnswerCallback,
): string | undefined {
    let toSay: string;

    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    if (lang === 'en') {
        toSay = getRandomPhrase('Error. See logs.');
    } else if (lang === 'de') {
        toSay = getRandomPhrase('Fehler. Sehe Logs.');
    } else if (lang === 'ru') {
        toSay = getRandomPhrase('Ошибка. Смотрите логи.');
    } else {
        toSay = '';
    }

    if (cb) {
        cb(toSay);
        return undefined;
    }
    return toSay;
}
