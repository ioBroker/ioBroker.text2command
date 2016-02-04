// TODO alarm on/off

var commands = {
    'whatTimeIsIt' : {
        icon: '',
        name: {
            'en': "What time is it?",
            'de': "Wie spät ist das?",
            'ru': "Сколько время?"
        },
        invisible: true,
        unique:    true,
        words: {
            'en': "time is it",
            'de': "zeit/spät",
            'ru': "сколько время"
        }
    },
    'whatIsYourName' : {
        icon: '',
        name: {
            'en': "What is your name?",
            'de': "Wie heißt du?",
            'ru': "Как тебя зовут?"
        },
        invisible: true,
        unique:    true,
        words: {
            'en': "your name",
            'de': "heißt du",
            'ru': "тебя зовут"
        },
        ack: {
            type: 'text',
            name: {
                'en': "Answer",
                'de': "Antwort",
                'ru': "Ответ"
            },
            default: {
                'en': "My name is Alpha/Alpha",
                'de': "Ich heiße Marvin/Marvin/Leute nennen mich Marvin",
                'ru': "Меня зовут Сонни/Сонни/Сонни моё имя"
            }
        }
    },
    'outsideTemperature' : {
        icon: '',
        name: {
            'en': "What is the outside temperature?",
            'de': "Wie kalt/warm ist draußen?",
            'ru': "Какая температура на улице?"
        },
        unique:   true,
        words: {
            'en': "outside temperature",
            'de': "aussen/draußen kalt/warm/temperatur",
            'ru': "температура снаружи/улице"
        },
        args: [{
            name: {
                'en': "Outside temperature ID",
                'de': "Außentemperatur ID",
                'ru': "ID сенсора на улице '.TEMPERATURE'"
            },
            type: 'id',
            role: 'value.temperature'
        }],
        ack: {
            type: 'text',
            name: {
                'en': "Answer (use %s for value)",
                'de': "Antwort (%s wird mit Wert ersetzt)",
                'ru': "Ответ (%s заменится значением)"
            },
            default: {
                'en': "Outside temperature is %s degree",
                'de': "Temperature draußen ist %s %u",
                'ru': "Темература на улице %s %u"
            }
        }
    },
    'insideTemperature' : {
        icon: '',
        name: {
            'en': "What is the inside temperature?",
            'de': "Wie kalt/warm ist drin?",
            'ru': "Какая температура дома?"
        },
        unique:   true,
        words: {
            'en': "inside temperature",
            'de': "intern/drin kalt/warm/temperatur",
            'ru': "температура дома/внутри/квартире"
        },
        args: [{
            name: {
                'en': "Inside temperature ID",
                'de': "Innentemperature ID",
                'ru': "ID сенсора дома '.TEMPERATURE'"
            },
            type: 'id',
            role: 'value.temperature'
        }],
        ack: {
            type: 'text',
            name: {
                'en': "Answer (use %s for value)",
                'de': "Antwort (%s wird mit Wert ersetzt)",
                'ru': "Ответ (%s заменится значением)"
            },
            default: {
                'en': "Inside temperature is %s degree",
                'de': "Temperature drin ist %s %u",
                'ru': "Темература дома %s %u"
            }
        }
    },
    'functionOnOff': {
        icon: '',
        name: {
            'en': "Switch on/off by function",
            'de': "Schalte an oder aus mit Funktion",
            'ru': "Включить/выключить приборы"
        },
        unique:   true,
        editable: false,
        words: {
            'en': "switch on/off",
            'de': "einschalten/ausschalten/ein/aus/an",
            'ru': "ключи/включи/включить/выключи/выключить/потушить/потуши/зажги/зажечь"
        },
        ack: {
            type: 'checkbox',
            name: {
                'en': "Answer with acknowledge",
                'de': "Antworten mit Bestätigung",
                'ru': "Ответить подтверждением"
            }
        }
    },
    'blindsUpDown': {
        icon: '',
        name: {
            'en': "Open/close blinds",
            'de': "Rollladen auf/zu machen",
            'ru': "Поднять опустить ставни"
        },
        unique:   true,
        editable: false,
        words: {
            'en': "blinds up/down",
            'de': "rollladen/rolllade/fenster/laden auf/zu/hoch/runter/machen",
            'ru': "ставни/окно/окна/жалюзи поднять/подними/опустить/опусти/открой/открою/открыть/закрыть/закрою/закрой"
        },
        ack: {
            type: 'checkbox',
            name: {
                'en': "Answer with acknowledge",
                'de': "Antworten mit Bestätigung",
                'ru': "Ответить подтверждением"
            }
        }
    },/*
    'openLock': {
        icon: '',
        name: {
            'en': "Open/close door lock",
            'de': "Türschloss auf/zu machen",
            'ru': "Открыть/закрыть замок на двери"
        },
        unique:   true,
        editable: false,
        words: {
            'en': "lock open/close",
            'de': "schloß/türschloß auf/zu",
            'ru': "замок открой/открою/открыть/закрыть/закрою/закрой"
        },
        ack: {
            type: 'checkbox',
            name: {
                'en': "Answer with acknowledge",
                'de': "Antworten mit Bestätigung",
                'ru': "Ответить подтверждением"
            },
            default: true
        }
    },*/
    'userDeviceControl' : {
        icon: '',
        name: {
            'en': "Switch something on/off",
            'de': "Schalte irgendwas an oder aus",
            'ru': "Что нибудь включить/выключить"
        },
        unique:   false,
        args: [{
            name: {
                'en': "Device or variable ID",
                'de': "Gerät- oder Variablen- ID",
                'ru': "ID сенсора или переменной"
            },
            type: 'id'
        }, {
            name: {
                'en': "Value to write down",
                'de': "Wert zum Schreiben",
                'ru': "Записываемое значение"
            },
            type: 'value'
        }],
        ack: {
            type: 'text',
            name: {
                'en': "Answer",
                'de': "Antworten",
                'ru': "Ответить"
            },
            default: {
                'en': "Switched on",
                'de': "Eingeschaltet",
                'ru': "Включено"
            }
        }
    },
    'userQuery' : {
        icon: '',
        name: {
            'en': "Ask about something",
            'de': "Fragen über irgendwas",
            'ru': "Спросить о чём-нибудь"
        },
        unique:   false,
        args: [{
            name: {
                'en': "Device or variable ID",
                'de': "Gerät- oder Variablen- ID",
                'ru': "ID сенсора или переменной"
            },
            type: 'id'
        }],
        ack: {
            type: 'text',
            name: {
                'en': "Answer (use %s for value)",
                'de': "Antwort (%s wird mit Wert ersetzt)",
                'ru': "Ответ (%s заменится значением)"
            },
            default: {
                'en': "%s",
                'de': "%s",
                'ru': "%s"
            }
        }
    },
    'goodBoy' : {
        icon: '',
        name: {
            'en': "You are good",
            'de': "Du bist gut",
            'ru': "Молодец"
        },
        invisible: true,
        unique:    true,
        words: {
            'en': "good",
            'de': "gut",
            'ru': "молодец/хорошая/хороший"
        },
        ack: {
            type: 'text',
            name: {
                'en': 'Answer',
                'de': 'Antwort',
                'ru': 'Ответ'
            },
            default: {
                'en': "Thank you/You are welcome",
                'de': "Danke/Freut mich",
                'ru': "Спасибо"
            }
        }
    },
    'thankYou' : {
        icon: '',
        name: {
            'en': "Thank you",
            'de': "Danke",
            'ru': "Спасибо"
        },
        invisible: true,
        unique:    true,
        words: {
            'en': "thank",
            'de': "danke",
            'ru': "спасибо"
        },
        ack: {
            type: 'text',
            name: {
                'en': 'Answer',
                'de': 'Antwort',
                'ru': 'Ответ'
            },
            default: {
                'en': "No problem/You are welcome",
                'de': "Kein problem/Bitte/Bitte sehr",
                'ru': "Пожалуйста/Всегда пожалуйста/Не за что/С радостью"
            }
        }
    }
};

// Translations for rooms, used for detection
var rooms =             {
    "everywhere":                               {"ru" : "везде/весь/все/всё",     "de": "alle/überall",         "en": "everywhere" },
    "livingroom/wohnzimmer/зал":                {"ru" : "зал",                    "de": "wohnzimmer",           "en": "living" },
    "bedroom/sleepingroom/schlafzimmer/спальня":{"ru" : "спальн",                 "de": "schlafzimmer",         "en": "bedroom" },
    "bathroom/bath/badezimmer/bad/ванная":      {"ru" : "ванн",                   "de": "bad",                  "en": "bath" },
    "office/arbeitszimmer/кабинет":             {"ru" : "кабинет",                "de": "arbeitszimmer/kabinet/büro","en": "working/office" },
    "nursery/kinderzimmer/детская":             {"ru" : "детск",                  "de": "kinder",               "en": "kids/child/nursery" },
    "guestwc/gästewc/гостевой туалет":          {"ru" : "гостевой туалет/гостевом туалет", "de": "gäste wc",    "en": "guets wc/guest closet" },
    "wc/туалет":                                {"ru" : "туалет",                 "de": "wc",                   "en": "wc/closet" },
    "floor/diele/gang/flur/коридор/прихожая":   {"ru" : "прихож/вход/коридор",    "de": "diele/eingang/flur",   "en": "floor/enter" },
    "kitchen/küche/kueche/кухня":               {"ru" : "кухня/кухне",            "de": "küche",                "en": "kitchen" },
    "terrace/balkon/terrasse/терасса/балкон":   {"ru" : "балкон/терасс",          "de": "balkon/terrasse",      "en": "balcony/terrace/patio" },
    "dinningroom/esszimmer/столовая":           {"ru" : "столовая",               "de": "esszimmer",            "en": "dinning" },
    "garage/garage/гараж":                      {"ru" : "гараж",                  "de": "garage",               "en": "garage" },
    "stairs/treppe/treppenhaus/лестница":       {"ru" : "лестниц",                "de": "treppe",               "en": "stair" },
    "garden/garten/сад":                        {"ru" : "сад",                    "de": "garten",               "en": "garden" },
    "court/hof/двор":                           {"ru" : "двор",                   "de": "hof",                  "en": "court/yard" },
    "guestroom/gästezimmer/гостевая":           {"ru" : "гостев",                 "de": "gästezimmer/gast",     "en": "guest room" },
    "attic/speicher/кладовка":                  {"ru" : "кладовк",                "de": "speicher",             "en": "attic" },
    "roof/dachstuhl/крыша":                     {"ru" : "крыше/крыша",            "de": "dachstuhl",            "en": "roof" },
    "terminal/anschlussraum/сени":              {"ru" : "сени/сенях",             "de": "anschlussraum",        "en": "terminal" },
    "washroom/waschraum/прачечная":             {"ru" : "прачечн",                "de": "waschraum",            "en": "wash room" },
    "heatroom/heizungsraum/котельная":          {"ru" : "котельн",                "de": "heizungsraum",         "en": "heat room" },
    "hovel/schuppen/scheune/сарай":             {"ru" : "сарай/сарае",            "de": "schuppen/scheune",     "en": "hovel" },
    "summerhouse/gartenhaus/теплица":           {"ru" : "теплиц",                 "de": "gartenhaus",           "en": "summer" }
};

// In room: used for answers
var roomsDative = {
    "everywhere":                               {"ru" : "во всём доме", "de": "überall",              "en": "everywhere" },
    "livingroom/wohnzimmer/зал":                {"ru" : "в зале",       "de": "im Wohnzimmer",        "en": "in the living room" },
    "bedroom/sleepingroom/schlafzimmer/спальня":{"ru" : "в спальне",    "de": "im Schlafzimmer",      "en": "in the bedroom" },
    "bathroom/bath/badezimmer/bad/ванная":      {"ru" : "в ванной",     "de": "im Bad",               "en": "in the bath" },
    "office/arbeitszimmer/кабинет":             {"ru" : "в кабинете",   "de": "im Arbeitszimmer",     "en": "in the office" },
    "nursery/kinderzimmer/детская":             {"ru" : "в детской",    "de": "im Kinderzimmer",      "en": "in the kids room" },
    "guestwc/gästewc/гостевой туалет":          {"ru" : "в гостевом туалете", "de": "im gäste wc",    "en": "in guets wc" },
    "wc/туалет":                                {"ru" : "в туалете",    "de": "im WC",                "en": "in wc" },
    "floor/diele/gang/flur/коридор/прихожая":   {"ru" : "в прихожей",   "de": "im Flur",              "en": "in the floor" },
    "kitchen/küche/kueche/кухня":               {"ru" : "на кухне",     "de": "in der Küche",         "en": "in the kitchen" },
    "terrace/balkon/terrasse/терасса/балкон":   {"ru" : "на балконе",   "de": "auf dem Balkon",       "en": "on the balcony" },
    "dinningroom/esszimmer/столовая":           {"ru" : "в столовой",   "de": "im Esszimmer",         "en": "in the dinning room" },
    "garage/garage/гараж":                      {"ru" : "в гараже",     "de": "in der Garage",        "en": "in the garage" },
    "stairs/treppe/treppenhaus/лестница":       {"ru" : "на лестнице",  "de": "auf der Treppe",       "en": "on the stairs" },
    "garden/garten/сад":                        {"ru" : "в саду",       "de": "im Garten",            "en": "in the garden" },
    "court/hof/двор":                           {"ru" : "во дворе",     "de": "im Hof",               "en": "in the court" },
    "guestroom/gästezimmer/гостевая":           {"ru" : "в гостевой",   "de": "im Gästezimmer/gast",  "en": "in the guest room" },
    "attic/speicher/кладовка":                  {"ru" : "в кладовке",   "de": "im Speicher",          "en": "in the attic" },
    "roof/dachstuhl/крыша":                     {"ru" : "на крыше",     "de": "im Dachstuhl",         "en": "on the roof" },
    "terminal/anschlussraum/сени":              {"ru" : "в сенях",      "de": "im Anschlussraum",     "en": "in the terminal" },
    "washroom/waschraum/прачечная":             {"ru" : "в прачечной",  "de": "im Waschraum",         "en": "in the wash room" },
    "heatroom/heizungsraum/котельная":          {"ru" : "в котельной",  "de": "im Heizungsraum",      "en": "in the heat room" },
    "hovel/schuppen/scheune/сарай":             {"ru" : "в сарае",      "de": "in der Schuppen",      "en": "in the hovel" },
    "summerhouse/gartenhaus/теплица":           {"ru" : "в теплице",    "de": "im Gartenhaus",        "en": "in the summer house" }
};

// Translation of functions, used for detection
var functions = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветк/светильник","de": "beleuchtung/rücklicht", "en": "back light/back light/rear light" },
    "light/licht/свет":                   {"ru" : "свет/лампу/лампа",   "de": "licht/lampe",     "en": "light/lamp" },
    "heating/heizung/отопление":          {"ru" : "отопление/батаре",   "de": "heizung",         "en": "heating" },
    "blind/rollade/rolladen/жалюзи/окна": {"ru" : "жалюзи/ставни",      "de": "rolllade",        "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музык",              "de": "musik",           "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнал/охран", "de": "sicherheit/alarm", "en": "security/alarm" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замок/дверь/ворота", "de": "verschluß/schloß/tür","en": "lock/door" }
};

// Used for answer
var functionsGenitive = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветки",          "de": "e Beleuchtung",  "en": "back light" },
    "light/licht/свет":                   {"ru" : "ламп",               "de": "e Lampen",       "en": "light" },
    "heating/heizung/отопление":          {"ru" : "отопление",          "de": "e Heizung",      "en": "heating" },
    "blind/rollade/rolladen/жалюзи/окна": {"ru" : "жалюзей",            "de": "e Rolllade",     "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музыки",             "de": "e Musik",        "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнализации", "de": "e Sicherheitssystem", "en": "security" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замков",             "de": "e Verschluße",   "en": "lock" }
};

// Used for answer
var functionsAccusative = {
    "backlight/beleuchtung/подсветка":    {"ru" : "подсветку",          "de": "die Beleuchtung","en": "back light" },
    "light/licht/свет":                   {"ru" : "свет",               "de": "das Licht",      "en": "light" },
    "heating/heizung/отопление":          {"ru" : "отопление",          "de": "die Heizung",    "en": "heating" },
    "blind/rollade/rolladen/жалюзи/окна": {"ru" : "жалюзи",             "de": "die Rolllade",   "en": "shutter" },
    "music/musik/музыка":                 {"ru" : "музыку",             "de": "die Musik",      "en": "music" },
    "security/sicherheit/alarm/alarmanlage/сигнализация/охрана": {"ru" : "сигнализацию", "de": "das Sicherheitssystem", "en": "security" },
    "lock/door/schloß/tür/замок/дверь":   {"ru" : "замок",              "de": "den Verschluß",  "en": "lock" }
};

function getRandomPhrase(arrOrText) {
    if (typeof arrOrText === 'string') {
        arrOrText = arrOrText.split('/');
    }

    if (typeof arrOrText === 'object') {
        if (arrOrText.length > 1) {
            var randomNumber = Math.floor(Math.random() * arrOrText.length);
            if (randomNumber > arrOrText.length - 1) {
                randomNumber = arrOrText.length - 1;
            }
            return arrOrText[randomNumber];
        } else {
            return arrOrText[0];
        }
    } else {
        return arrOrText;
    }
}

function sayIDontKnow(lang, text, args, ack, cb) {
    var toSay;
    if (lang == "ru") {
        toSay = getRandomPhrase(["Извините, но ", "Прошу прощения, но ", ""]) +
            getRandomPhrase(["Я не знаю", "Нет данных"]);
    }
    else if (lang == "de") {
        toSay = getRandomPhrase(["Entschuldigen sie. ", "Es tut mir leid. ", ""]) +
            getRandomPhrase(["Ich weiss nicht", "Keine Daten vorhanden"]);
    }
    else if (lang == "en") {
        toSay = getRandomPhrase(["I am sorry, but ", "Excus me. ", ""]) +
            getRandomPhrase(["I don't know", "No data available"]);
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

function sayNoName(lang, text, args, ack, cb) {
    var toSay;

    if (lang == "ru") {
        toSay = "Обращайся ко мне как хочешь. У меня нет имени";
    }
    else if (lang == "de") {
        toSay = "Nenne mich wie du willst. Ich habe keinen Namen.";
    }
    else if (lang == "en") {
        toSay = "Call me as you wish. I don't have name";
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

function sayIDontUnderstand(lang, text, args, ack, cb) {
    var toSay;
    if (lang == "ru") {
        if (!text) {
            toSay = "Я не расслышала комманду";
        }
        else{
            toSay = "Я не расслышала и поняла только " + text;
        }
    }
    else if (lang == "de") {
        if (!text) {
            toSay ="Ich habe nichts gehoert";
        }
        else{
            toSay ="Ich habe gehoert nur "+ text;
        }
    }
    else if (lang == "en") {
        if (!text) {
            toSay = "I could not hear you";
        }
        else{
            toSay = "I don't understand and could hear only " + text;
        }
    }

    cb(toSay);
}

function sayNoSuchRoom(lang, text, args, ack, cb) {
    var toSay;
    if (lang == 'en') {
        toSay = getRandomPhrase(['Room not present', 'Room not found', 'You don\'t have such a room']);
    } else
    if (lang == 'de') {
        toSay = getRandomPhrase(['Raum ist nicht gefunden', 'Es gibt kein Zimmer mit dem Namen', 'Man muss sagen im welchen Raum oder überall']);
    } else
    if (lang == 'ru') {
        toSay = getRandomPhrase(['Комната не найдена', 'Надо сказать в какой комнате или сказать везде']);
    } else {
        toSay = "";
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

function sayNothingToDo(lang, text, args, ack, cb) {
    var toSay;
    if (lang == 'en') {
        toSay = getRandomPhrase(['I don\'t know, what to do', 'No action defined']);
    } else
    if (lang == 'de') {
        toSay = getRandomPhrase(['Ich weiß nicht, was ich machen soll', 'Aktion ist nicht definiert']);
    } else
    if (lang == 'ru') {
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

function sayNoSuchFunction(lang, text, args, ack, cb) {
    var toSay;
    if (lang == 'en') {
        toSay = getRandomPhrase('Function not present/Function not found/You don\'t have such a device');
    } else
    if (lang == 'de') {
        toSay = getRandomPhrase('Die Rolle ist nicht gefunden/Es gibt keine Rolle mit dem Namen/Man muss sagen womit man was machen will');
    } else
    if (lang == 'ru') {
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

function sayNoFunctionInThisRoom(lang, text, args, ack, cb) {
    var sRoom     = args[0];
    var sFunction = args[1];

    var toSay;
    if (lang == 'en') {
        toSay = 'There is no ' + functionsGenitive[sFunction][lang] + ' ' + roomsDative[sRoom][lang];
    } else if (lang == 'de') {
        toSay = 'Es gibt kein' + functionsGenitive[sFunction][lang] + ' ' + roomsDative[sRoom][lang];
    } else if (lang == 'ru') {
        toSay = roomsDative[sRoom][lang] + ' нет ' + functionsGenitive[sFunction][lang];
    } else {
        toSay = '';
    }
    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

function sayError(lang, text, args, ack, cb) {
    var toSay;
    if (lang == 'en') {
        toSay = getRandomPhrase('Error. See logs.');
    } else
    if (lang == 'de') {
        toSay = getRandomPhrase('Fehler. Sehe Logs.');
    } else
    if (lang == 'ru') {
        toSay = getRandomPhrase('Ошибка. Смотрите логи.');
    } else {
        toSay = "";
    }

    if (cb) {
        cb(toSay);
    } else {
        return toSay;
    }
}

function findMatched(cmd, _rules) {
    var matchedRules = [];

    cmd = cmd.toLowerCase();

    var ix = cmd.indexOf(';');
    if (ix != -1) cmd = cmd.substring(ix + 1);

    ix = cmd.indexOf('[');
    if (ix != -1) cmd = cmd.substring(0, ix);

    var cmdWords = cmd.split(' ');

    for (var r = 0; r < _rules.length; r++) {
        var rule = _rules[r];
        if (!rule.words) continue;

        var isFound = true;

        // split rule words one time
        if (typeof rule.words === 'string') {
            // if regex
            if (rule.words[0] === '/') {
                rule.words = new RegExp(rule.words, 'i');
            } else {
                rule.words = rule.words.toLowerCase().split(' ');
            }
        }

        // if regexp
        if (rule.words instanceof RegExp) {
            isFound = rule.words.test(cmd);
        } else {
            // compare every word
            for (var j = 0; j < rule.words.length; j++) {

                if (rule.words[j].indexOf ('/') != -1) rule.words[j] = rule.words[j].split('/');

                // if one of
                if (typeof rule.words[j] === 'object') {
                    var _isFound = false;

                    for (var u = 0; u < rule.words[j].length; u++) {
                        if (cmdWords.indexOf(rule.words[j][u]) != -1) {
                            _isFound = true;
                            break;
                        }
                    }

                    if (!_isFound){
                        isFound = false;
                        break;
                    }
                }
                else
                if (cmdWords.indexOf(rule.words[j]) === -1) {
                    isFound = false;
                    break;
                }
            }
        }

        if (isFound) {
            matchedRules.push(r);
            if (rule._break) break;
        }
    }
    return matchedRules;
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = {
        commands:                commands,
        rooms:                   rooms,
        functions:               functions,
        functionsAccusative:     functionsAccusative,
        functionsGenitive:       functionsGenitive,
        roomsDative:             roomsDative,
        getRandomPhrase:         getRandomPhrase,
        sayIDontKnow:            sayIDontKnow,
        sayNoName:               sayNoName,
        sayIDontUnderstand:      sayIDontUnderstand,
        sayNoSuchRoom:           sayNoSuchRoom,
        sayNoSuchFunction:       sayNoSuchFunction,
        sayNothingToDo:          sayNothingToDo,
        sayError:                sayError,
        sayNoFunctionInThisRoom: sayNoFunctionInThisRoom,
        findMatched:             findMatched
    };
}