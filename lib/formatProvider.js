/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

let language = 'en'; // default language, if parameter is missed on function calls

/**
 * returns a text like 1 second or 5 minutes
 * @param {number} value the value
 * @param {string} type 'seconds', 'minutes', 'hour' or 'days'
 * @param {string} lang optional language, like de,ru or en. default is global language, set by setLanguage
 */
function formatIntervalHelper (value, type, lang) {
    let singular;
    let plural;
    let special24;
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    lang = lang || language;
    if (lang === 'de') {
        if (type === 'seconds') {
            singular = 'Sekunde';
            plural   = 'Sekunden';
        } else if (type === 'minutes') {
            singular = 'Minute';
            plural   = 'Minuten';
        } else if (type === 'hours') {
            singular = 'Stunde';
            plural   = 'Stunden';
        } else if (type === 'days') {
            singular = 'Tag';
            plural   = 'Tagen';
        }
    } else if (lang === 'ru') {
        if (type === 'seconds') {
            singular  = 'секунду';
            plural    = 'секунд';
            special24 = 'секунды';
        } else if (type === 'minutes') {
            singular  = 'минуту';
            plural    = 'минут';
            special24 = 'минуты';
        } else if (type === 'hours') {
            singular  = 'час';
            plural    = 'часов';
            special24 = 'часа';
        } else if (type === 'days') {
            singular  = 'день';
            plural    = 'дней';
            special24 = 'дня';
        }
    } else {
        if (type === 'seconds') {
            singular = 'second';
            plural   = 'seconds';
        } else if (type === 'minutes') {
            singular = 'minute';
            plural   = 'minutes';
        } else if (type === 'hours') {
            singular = 'hour';
            plural   = 'hours';
        } else if (type === 'days') {
            singular = 'day';
            plural   = 'days';
        }
    }

    if (value === 1) {
        if (lang === 'de') {
            if (type === 'days' ) {
                return 'einem ' + singular;
            } else {
                return 'einer ' + singular;
            }
        } else if (lang === 'ru') {
            if (type === 'days' || type === 'hours') {
                return 'один ' + singular;
            } else {
                return 'одну ' + singular;
            }
        } else {
            return 'one ' + singular;
        }
    } else {
        if (lang === 'de') {
            return value + ' ' + plural;
        } else if (lang === 'ru') {
            const d = value % 10;
            if (d === 1 && value !== 11) {
                return value + ' ' + singular;
            } else
            if (d >= 2 && d <= 4 && (value > 20 || value < 10)) {
                return value + ' ' + special24;
            } else {
                return value + ' ' + plural;
            }
        } else {
            return value + ' ' + plural;
        }
    }
}

/**
 * formats a time difference to get something like 5 days and 4 hours ago 
 * @param {number} timestamp time to differ with current time
 * @param {boolean} useSuffix if true, the text will end with ago for en, otherwise only the time will retuned 
 * @param {string} lang optional language, like de,ru or en. default is global languge, set by setLanguage
 */
function formatInterval (timestamp, useSuffix, lang) {
    lang = lang || language;
    let diff = new Date().getTime() - timestamp;
    diff = Math.round(diff / 1000);
    let text= '';
    // TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"
    let connectorWord = ' and ';
    if (lang === 'de') {
        connectorWord = ' und ';
    } else if (lang === 'ru') {
        connectorWord = ' и ';
    }

    if (diff <= 60) {
        text = formatIntervalHelper(diff, 'seconds', lang);
    } else if (diff < 3600) {
        const m = Math.floor(diff / 60);
        const s = diff - m * 60;
        text = formatIntervalHelper(m, 'minutes', lang);

        if (m < 5 && s > 0) {
            // add seconds
            text += connectorWord + formatIntervalHelper(s, 'seconds', lang);
        }
    } else if (diff < 3600 * 24) {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff - h * 3600) / 60);
        text = formatIntervalHelper(h, 'hours',lang);

        if (h < 10 && m > 0) {
            // add minutes
            text += connectorWord + formatIntervalHelper(m, 'minutes', lang);
        }
    } else {
        const d = Math.floor(diff / (3600 * 24));
        const h = Math.floor((diff - d * (3600 * 24)) / 3600);
        text = formatIntervalHelper(d, 'days', lang);

        if (d < 3 && h > 0) {
            // add hours
            text += connectorWord + formatIntervalHelper(h, 'hours', lang);
        }
    }
    if (text && useSuffix){
        if (lang === 'de') {
            return 'vor ' + text;
        } else if (lang === 'ru') {
            return text + ' назад';
        } else {
            return text + ' ago';
        }
    } else
        return text;
}
/**
 * set default language for format functions
 * @param {*} lang 
 */
function setLanguage(lang) {
    language = lang;
}

module.exports = {
    formatInterval,
    formatIntervalHelper,
    setLanguage
};








