// TODO alarm on/off
// alarm clock set/off
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
            'de': "zeit/spät/spaet",
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
            'de': "heißt/heisst du",
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
                'en': "Outside temperature is %s %u",
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
                'en': "Inside temperature is %s %u",
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
    },
    'sendText': {
        icon: '',
        name: {
            'en': "Write text to state",
            'de': "Schreibe Text in den Zustand",
            'ru': "Записать текст в переменную"
        },
        unique:   false,
        editable: true,
        removeKeys: true,
        words: {
            'en': "send text",
            'de': "sende text",
            'ru': "послать текст"
        },
        ack: {
            type: 'text',
            name: {
                'en': "Answer",
                'de': "Antwort",
                'ru': "Ответ"
            },
            default: {
                'en': "Following text was sent: %s",
                'de': "Folgender Text gesendet: %s",
                'ru': "Отосланный текст %s"
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

function findMatched(cmd, _rules) {
    var matchedRules = [];

    cmd = cmd.toLowerCase().replace(/[!?.,;:]+/g, ' ').replace(/\s\s/g, ' ');

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
        commands:    commands,
        findMatched: findMatched
    };
}