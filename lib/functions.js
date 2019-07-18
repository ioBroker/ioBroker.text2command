/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';

// TODO: translate it to "it, es, pl, pt, nl, fr, zh-cn"

// Translation of functions, used for detection
const functions = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветк/светильник","de": "beleuchtung/rücklicht", "en": "back light/back light/rear light" },
    "light/licht/свет":                   {"ru" : "свет/лампу/лампа",   "de": "licht/lampe",     "en": "light/lamp" },
    "heating/heizung/отопление":          {"ru" : "отопление/батаре",   "de": "heizung",         "en": "heating" },
    "blind/rollladen/rolladen/жалюзи/окна": {"ru" : "жалюзи/ставни",    "de": "rollladen",       "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музык",              "de": "musik",           "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнал/охран", "de": "sicherheit/alarm", "en": "security/alarm" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замок/дверь/ворота", "de": "verschluß/schloß/tür","en": "lock/door" }
};

// Used for answer
const functionsGenitive = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветки",          "de": "e Beleuchtung",  "en": "back light" },
    "light/licht/свет":                   {"ru" : "ламп",               "de": "e Lampen",       "en": "light" },
    "heating/heizung/отопление":          {"ru" : "отопление",          "de": "e Heizung",      "en": "heating" },
    "blind/rollladen/rolladen/жалюзи/окна": {"ru" : "жалюзей",          "de": "e Rollladen",    "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музыки",             "de": "e Musik",        "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнализации", "de": "e Sicherheitssystem", "en": "security" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замков",             "de": "e Verschluße",   "en": "lock" }
};

// Used for answer
const functionsAccusative = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветку",          "de": "die Beleuchtung","en": "back light" },
    "light/licht/свет":                   {"ru" : "свет",               "de": "das Licht",      "en": "light" },
    "heating/heizung/отопление":          {"ru" : "отопление",          "de": "die Heizung",    "en": "heating" },
    "blind/rollladen/rolladen/жалюзи/окна": {"ru" : "жалюзи",           "de": "die Rollladen",  "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музыку",             "de": "die Musik",      "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнализацию", "de": "das Sicherheitssystem", "en": "security" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замок",              "de": "den Verschluß",  "en": "lock" }
};

module.exports = {
    functionsAccusative,
    functionsGenitive,
    functions
};
