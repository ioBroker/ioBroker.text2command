/* Attention:
  This file used in Front-end and in the backend. Originally it is placed in /lib/langModel.js
  and will be coped by gulp to src/public/langModel.js
 */
/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */

// eslint-disable-next-line
'use strict';

// TODO: translate it to 'it, es, pl, pt, nl, fr, 'zh-cn''
// TODO alarm on/off
// alarm clock set/off
const commands = {
    whatTimeIsIt: {
        icon: '',
        name: {
            en: 'What time is it?',
            de: 'Wie spät ist es?',
            ru: 'Сколько время?',
            pt: 'Que horas são?',
            nl: 'Hoe laat is het?',
            fr: 'Quelle heure est-il?',
            it: 'Che ore sono?',
            es: '¿Que hora es?',
            pl: 'Która godzina?',
            'zh-cn': '现在是几奌？'
        },
        invisible: true,
        unique: true,
        words: {
            en: 'time is it',
            de: 'zeit/spät/spaet',
            ru: 'сколько время',
        },
    },
    whatIsYourName: {
        icon: '',
        name: {
            en: 'What is your name?',
            de: 'Wie heißt du?',
            ru: 'Как тебя зовут?',
        },
        invisible: true,
        unique: true,
        words: {
            en: 'your name',
            de: 'heißt/heisst du',
            ru: 'тебя зовут',
            pt: 'Qual é o seu nome?',
            nl: 'Wat is jouw naam?',
            fr: 'Quel est votre nom?',
            it: 'Come ti chiami?',
            es: '¿Cuál es tu nombre?',
            pl: 'Jak masz na imię?',
            'zh-cn': '你叫什么名字？'
        },
        ack: {
            type: 'text',
            name: {
                en: 'Answer',
                de: 'Antwort',
                ru: 'Ответ',
                pt: 'Responda',
                nl: 'Antwoord',
                fr: 'Répondre',
                it: 'Risposta',
                es: 'Responder',
                pl: 'Odpowiedź',
                'zh-cn': '回答'
            },
            default: {
                en: 'My name is Alpha/Alpha',
                de: 'Ich heiße Marvin/Marvin/Leute nennen mich Marvin',
                ru: 'Меня зовут Сонни/Сонни/Сонни моё имя',
            },
        },
    },
    outsideTemperature: {
        icon: '',
        name: {
            en: 'What is the outside temperature?',
            de: 'Wie kalt/warm ist es draußen?',
            ru: 'Какая температура на улице?',
            pt: 'Qual é a temperatura externa?',
            nl: 'Wat is de buitentemperatuur?',
            fr: 'Quelle est la température extérieure?',
            it: 'Qual è la temperatura esterna?',
            es: '¿Cuál es la temperatura exterior?',
            pl: 'Jaka jest temperatura zewnętrzna?',
            'zh-cn': '外界温度是多少？',
        },
        unique: true,
        words: {
            en: 'outside temperature',
            de: 'aussen/draußen/außentemperatur kalt/warm/temperatur/außentemperatur',
            ru: 'температура снаружи/улице',
        },
        args: [
            {
                name: {
                    en: 'Outside temperature ID',
                    de: 'Außentemperatur ID',
                    ru: `ID сенсора на улице ".TEMPERATURE"`,
                    pt: 'ID da temperatura externa',
                    nl: 'Buitentemperatuur ID',
                    fr: 'ID de température extérieure',
                    it: 'ID temperatura esterna',
                    es: 'ID de temperatura exterior',
                    pl: 'ID temperatury zewnętrznej',
                    'zh-cn': '外部温度ID',
                },
                type: 'id',
                role: 'value.temperature',
            },
            {
                name: {
                    "en": "Decimal places",
                    "de": "Nachkommastellen",
                    "ru": "Десятичные разряды",
                    "pt": "Casas decimais",
                    "nl": "decimalen",
                    "fr": "Décimales",
                    "it": "Decimali",
                    "es": "Lugares decimales",
                    "pl": "Miejsca dziesiętne",
                    "zh-cn": "小数位",
                },
                type: 'number',
                decimal: true,
                default: 0
            },
        ],
        ack: {
            type: 'text',
            name: {
                en: 'Answer (use %s for value)',
                de: 'Antwort (%s wird mit Wert ersetzt)',
                ru: 'Ответ (%s заменится значением)',
                pt: 'Resposta (use %s  como valor)',
                nl: 'Antwoord (gebruik %s  als waarde)',
                fr: 'Réponse (utilisez %s  pour la valeur)',
                it: 'Risposta (usa %s  per valore)',
                es: 'Respuesta (use %s  para el valor)',
                pl: 'Odpowiedź (użyj wartości %s )',
                'zh-cn': '答案（将％s用作值）',
            },
            default: {
                en: 'Outside temperature is %s %u',
                de: 'Die Außentemperatur beträgt %s %u',
                ru: 'Температура на улице %s %u',
            },
        },
    },
    insideTemperature: {
        icon: '',
        name: {
            en: 'What is the inside temperature?',
            de: 'Wie kalt/warm ist es drin?',
            ru: 'Какая температура дома?',
            pt: 'Qual é a temperatura interna?',
            nl: 'Wat is de binnentemperatuur?',
            fr: 'Quelle est la température intérieure?',
            it: 'Qual è la temperatura interna?',
            es: '¿Cuál es la temperatura interior?',
            pl: 'Jaka jest temperatura wewnętrzna?',
            'zh-cn': '内部温度是多少？',
        },
        unique: true,
        words: {
            en: 'inside temperature',
            de: 'innen/drinnen/intern/drin/innentemperatur kalt/warm/temperatur/innentemperatur',
            ru: 'температура дома/внутри/квартире',
        },
        args: [
            {
                name: {
                    en: 'Inside temperature ID',
                    de: 'Innentemperatur ID',
                    ru: `ID сенсора дома ".TEMPERATURE"`,
                    pt: 'ID da temperatura interna',
                    nl: 'Binnentemperatuur ID',
                    fr: 'ID de température intérieure',
                    it: 'ID temperatura interna',
                    es: 'ID de temperatura interior',
                    pl: 'ID temperatury wewnętrznej',
                    'zh-cn': '内部温度ID',
                },
                type: 'id',
                role: 'value.temperature',
            },
            {
                name: {
                    "en": "Decimal places",
                    "de": "Nachkommastellen",
                    "ru": "Десятичные разряды",
                    "pt": "Casas decimais",
                    "nl": "decimalen",
                    "fr": "Décimales",
                    "it": "Decimali",
                    "es": "Lugares decimales",
                    "pl": "Miejsca dziesiętne",
                    "zh-cn": "小数位",
                },
                decimal: true,
                type: 'number',
                default: 0,
            },
        ],
        ack: {
            type: 'text',
            name: {
                en: 'Answer (use %s for value)',
                de: 'Antwort (%s wird mit Wert ersetzt)',
                ru: 'Ответ (%s заменится значением)',
                pt: 'Resposta (use %s  como valor)',
                nl: 'Antwoord (gebruik %s  als waarde)',
                fr: 'Réponse (utilisez %s  pour la valeur)',
                it: 'Risposta (usa %s  per valore)',
                es: 'Respuesta (use %s  para el valor)',
                pl: 'Odpowiedź (użyj wartości %s )',
                'zh-cn': '答案（将％s用作值）',
            },
            default: {
                en: 'Inside temperature is %s %u',
                de: 'Die Innentemperatur beträgt %s %u',
                ru: 'Температура дома %s %u',
                pt: 'A temperatura interna é %s %u',
                nl: 'Binnentemperatuur is %s %u',
                fr: 'La température intérieure est %s %u',
                it: 'La temperatura interna è %s %u',
                es: 'La temperatura interior es %s %u',
                pl: 'Temperatura wewnętrzna wynosi %s %u',
                'zh-cn': '内部温度为%s%u',
            },
        },
    },
    functionOnOff: {
        icon: '',
        name: {
            en: 'switch on/off by function',
            de: 'Schalte an oder aus mit Funktion',
            ru: 'Включить/выключить приборы',
            pt: 'ligar / desligar por função',
            nl: 'in- / uitschakelen per functie',
            fr: 'allumer / éteindre par fonction',
            it: 'accendere / spegnere per funzione',
            es: 'encender / apagar por función',
            pl: 'włącz / wyłącz według funkcji',
            'zh-cn': '按功能打开/关闭',
        },
        unique: true,
        editable: false,
        words: {
            en: 'switch/turn/set on/off/percent',
            de: 'einschalten/ausschalten/ein/aus/an/prozent',
            ru: 'ключи/включи/включить/выключи/выключить/потушить/потуши/зажги/зажечь/процентов/процент/процента',
        },
        args: [
            {
                name: {
                    en: 'Use 0/1, not false/true',
                    de: 'Benutze 0/1, nicht false/true',
                    ru: 'Писать 0/1, а не false/true',
                    pt: 'Use 0/1, não falso / verdadeiro',
                    nl: 'Gebruik 0/1, niet false / true',
                    fr: 'Utilisez 0/1, pas faux / vrai',
                    it: 'Usa 0/1, non falso / vero',
                    es: 'Use 0/1, no falso / verdadero',
                    pl: 'Użyj 0/1, nie fałsz / prawda',
                    'zh-cn': '使用0/1，而不是false / true',
                },
                default: false,
                type: 'checkbox',
            },
        ],
        ack: {
            type: 'checkbox',
            name: {
                en: 'Answer with acknowledge',
                de: 'Antworten mit Bestätigung',
                ru: 'Ответить подтверждением',
                pt: 'Responder com reconhecimento',
                nl: 'Antwoord met erkennen',
                fr: 'Répondre avec accusé de réception',
                it: 'Rispondi con conferma',
                es: 'Responda con reconocimiento',
                pl: 'Odpowiedz z potwierdzeniem',
                'zh-cn': '确认答复',
            },
        },
    },
    blindsUpDown: {
        icon: '',
        name: {
            en: 'open/close blinds',
            de: 'Rollladen auf/zu machen',
            ru: 'Поднять/опустить ставни',
            pt: 'abrir / fechar persianas',
            nl: 'jaloezieën openen / sluiten',
            fr: 'ouvrir / fermer les stores',
            it: 'aprire / chiudere i bui',
            es: 'abrir / cerrar persianas',
            pl: 'otwieranie / zamykanie żaluzji',
            'zh-cn': '打开/关闭百叶窗',
        },
        unique: true,
        editable: false,
        words: {
            en: 'blind/blinds/shutter/shutters up/down/percent',
            de: 'rollladen/rollläden/rolladen/rolläden/beschattung/fenster/laden/rollo auf/zu/hoch/runter/prozent',
            ru: 'ставни/окно/окна/жалюзи поднять/подними/опустить/опусти/открой/открою/открыть/закрыть/закрою/закрой/процентов/процент/процента',
        },
        ack: {
            type: 'checkbox',
            name: {
                en: 'Answer with acknowledge',
                de: 'Antworten mit Bestätigung',
                ru: 'Ответить подтверждением',
                pt: 'Responder com reconhecimento',
                nl: 'Antwoord met erkennen',
                fr: 'Répondre avec accusé de réception',
                it: 'Rispondi con conferma',
                es: 'Responda con reconocimiento',
                pl: 'Odpowiedz z potwierdzeniem',
                'zh-cn': '确认答复',
            },
        },
    },
    sendText: {
        icon: '',
        name: {
            en: 'Write text to state',
            de: 'Schreibe Text in den Zustand',
            ru: 'Записать текст в переменную',
            pt: 'Escreva texto para indicar',
            nl: 'Schrijf tekst naar staat',
            fr: 'Écrire du texte pour énoncer',
            it: 'Scrivi testo per dichiarare',
            es: 'Escribir texto para indicar',
            pl: 'Napisz tekst do stwierdzenia',
            'zh-cn': '写文字说明',
        },
        unique: false,
        editable: true,
        extractText: true,
        words: {
            en: 'send text',
            de: 'sende text',
            ru: 'послать текст',
            pt: 'mande mensagem',
            nl: 'stuur tekst',
            fr: 'envoyer du texte',
            it: 'invia testo',
            es: 'enviar texto',
            pl: 'wyslij wiadomość',
            'zh-cn': '发短讯',
        },
        args: [
            {
                name: {
                    en: 'Device or variable ID',
                    de: 'Gerät- oder Variablen- ID',
                    ru: 'ID сенсора или переменной',
                    pt: 'ID do dispositivo ou variável',
                    nl: 'Apparaat- of variabele ID',
                    fr: 'ID de périphérique ou de variable',
                    it: 'ID dispositivo o variabile',
                    es: 'ID de dispositivo o variable',
                    pl: 'Identyfikator urządzenia lub zmiennej',
                    'zh-cn': '设备或变量ID',
                },
                type: 'id',
            },
            {
                name: {
                    en: 'Value to write down',
                    de: 'Wert zum Schreiben',
                    ru: 'Записываемое значение',
                    pt: 'Valor a anotar',
                    nl: 'Waarde om op te schrijven',
                    fr: 'Valeur à noter',
                    it: 'Valore da annotare',
                    es: 'Valor para anotar',
                    pl: 'Wartość do zanotowania',
                    'zh-cn': '写下价值',
                },
                type: 'value',
                default: '%s',
            },
        ],
        ack: {
            type: 'text',
            name: {
                en: 'Answer',
                de: 'Antwort',
                ru: 'Ответ',
                pt: 'Responda',
                nl: 'Antwoord',
                fr: 'Répondre',
                it: 'Risposta',
                es: 'Responder',
                pl: 'Odpowiedź',
                'zh-cn': '回答',
            },
            default: {
                en: 'Following text was sent: %s',
                de: 'Folgender Text gesendet: %s',
                ru: 'Отосланный текст %s',
                pt: 'O texto a seguir foi enviado: %s',
                nl: 'Volgende tekst is verzonden: %s',
                fr: 'Le texte suivant a été envoyé: %s',
                it: 'È stato inviato il seguente testo: %s',
                es: 'Se envió el siguiente texto: %s',
                pl: 'Wysłano następujący tekst: %s',
                'zh-cn': '已发送以下文本：%s',
            },
        },
    } /*
    'openLock': {
        icon: '',
        name: {
            'en': 'Open/close door lock',
            'de': 'Türschloss auf/zu machen',
            'ru': 'Открыть/закрыть замок на двери',
            pt: 'Abrir / fechar a fechadura da porta',
            nl: 'Deurslot openen / sluiten',
            fr: 'Ouvrir / fermer la serrure de porte',
            it: 'Aprire / chiudere la serratura della porta',
            es: 'Abrir / cerrar cerradura de puerta',
            pl: 'Otwórz / zamknij zamek drzwi',
            'zh-cn': '开/关门锁'
        },
        unique:   true,
        editable: false,
        words: {
            'en': 'lock open/close',
            'de': 'schloß/türschloß auf/zu',
            'ru': 'замок открой/открою/открыть/закрыть/закрою/закрой',
            pt: 'bloquear abrir / fechar',
            nl: 'slot open / dicht',
            fr: 'verrouillage ouvert / fermé',
            it: 'blocco apertura / chiusura',
            es: 'cerradura abierta / cerrada',
            pl: 'zamek otwórz / zamknij',
            'zh-cn': '锁打开/关闭'
        },
        ack: {
            type: 'checkbox',
            name: {
                'en': 'Answer with acknowledge',
                'de': 'Antworten mit Bestätigung',
                'ru': 'Ответить подтверждением',
                pt: 'Responder com reconhecimento',
                nl: 'Antwoord met erkennen',
                fr: 'Répondre avec accusé de réception',
                it: 'Rispondi con conferma',
                es: 'Responda con reconocimiento',
                pl: 'Odpowiedz z potwierdzeniem',
                'zh-cn': '确认答复'
            },
            default: true
        }
    },*/,
    userDeviceControl: {
        icon: '',
        name: {
            en: 'Switch something on/off',
            de: 'Schalte irgendwas an oder aus',
            ru: 'Что нибудь включить/выключить',
            pt: 'Ligar / desligar algo',
            nl: 'Zet iets aan / uit',
            fr: 'Activer / désactiver quelque chose',
            it: 'Accendi / spegni qualcosa',
            es: 'Enciende / apaga algo',
            pl: 'Włącz / wyłącz coś',
            'zh-cn': '开启/关闭某些功能',
        },
        unique: false,
        args: [
            {
                name: {
                    en: 'Device or variable ID',
                    de: 'Gerät- oder Variablen- ID',
                    ru: 'ID сенсора или переменной',
                    pt: 'ID do dispositivo ou variável',
                    nl: 'Apparaat- of variabele ID',
                    fr: 'ID de périphérique ou de variable',
                    it: 'ID dispositivo o variabile',
                    es: 'ID de dispositivo o variable',
                    pl: 'Identyfikator urządzenia lub zmiennej',
                    'zh-cn': '设备或变量ID',
                },
                type: 'id',
            },
            {
                name: {
                    en: 'Value to write down',
                    de: 'Wert zum Schreiben',
                    ru: 'Записываемое значение',
                    pt: 'Valor a anotar',
                    nl: 'Waarde om op te schrijven',
                    fr: 'Valeur à noter',
                    it: 'Valore da annotare',
                    es: 'Valor para anotar',
                    pl: 'Wartość do zanotowania',
                    'zh-cn': '写下价值',
                },
                type: 'value',
            },
        ],
        ack: {
            type: 'text',
            name: {
                en: 'Answer',
                de: 'Antworten',
                ru: 'Ответить',
                pt: 'Responda',
                nl: 'Antwoord',
                fr: 'Répondre',
                it: 'Risposta',
                es: 'Responder',
                pl: 'Odpowiedź',
                'zh-cn': '回答',
            },
            default: {
                en: 'Switched on',
                de: 'Eingeschaltet',
                ru: 'Включено',
                pt: 'Ligado',
                nl: 'Ingeschakeld',
                fr: 'Allumé',
                it: 'Acceso',
                es: 'Encendido',
                pl: 'Włączony',
                'zh-cn': '切换到',
            },
        },
    },
    userQuery: {
        icon: '',
        name: {
            en: 'Ask about something',
            de: 'Fragen über irgendwas',
            ru: 'Спросить о чём-нибудь',
            pt: 'Pergunte sobre algo',
            nl: 'Vraag iets',
            fr: 'Demandez quelque chose',
            it: 'Chiedi qualcosa',
            es: 'Pregunta por algo',
            pl: 'Zapytaj o coś',
            'zh-cn': '询问一些事情',
        },
        unique: false,
        args: [
            {
                name: {
                    en: 'Device or variable ID',
                    de: 'Gerät- oder Variablen- ID',
                    ru: 'ID сенсора или переменной',
                    pt: 'ID do dispositivo ou variável',
                    nl: 'Apparaat- of variabele ID',
                    fr: 'ID de périphérique ou de variable',
                    it: 'ID dispositivo o variabile',
                    es: 'ID de dispositivo o variable',
                    pl: 'Identyfikator urządzenia lub zmiennej',
                    'zh-cn': '设备或变量ID',
                },
                type: 'id',
            },
            {
                name: {
                    "en": "Convert 0/1 to yes/no",
                    "de": "Wandeln 0/1 in ja/nein um",
                    "ru": "Преобразовать 0/1 в да/нет",
                    "pt": "Converter 0/1 em falso/verdadeiro",
                    "nl": "Converteer 0/1 naar false/true",
                    "fr": "Convertir 0/1 en faux/vrai",
                    "it": "Converti 0/1 in falso/vero",
                    "es": "Convertir 0/1 a falso/verdadero",
                    "pl": "Konwertuj 0/1 na fałsz/prawdę",
                    "zh-cn": "将 0/1 转换为假/真",
                },
                default: false,
                type: 'checkbox',
            },
            {
                name: {
                    en: 'Device or variable ID (%s1, %u1)',
                    de: 'Gerät- oder Variablen- ID (%s1, %u1)',
                    ru: 'ID сенсора или переменной (%s1, %u1)',
                    pt: 'ID do dispositivo ou variável (%s1, %u1)',
                    nl: 'Apparaat- of variabele ID (%s1, %u1)',
                    fr: 'ID de périphérique ou de variable (%s1, %u1)',
                    it: 'ID dispositivo o variabile (%s1, %u1)',
                    es: 'ID de dispositivo o variable (%s1, %u1)',
                    pl: 'Identyfikator urządzenia lub zmiennej (%s1, %u1)',
                    'zh-cn': '设备或变量ID (%s1, %u1)',
                },
                type: 'id',
            },
        ],
        ack: {
            type: 'text',
            name: {
                en: 'Answer (use %s for value)',
                de: 'Antwort (%s wird mit Wert ersetzt)',
                ru: 'Ответ (%s заменится значением)',
                pt: 'Resposta (use %s  como valor)',
                nl: 'Antwoord (gebruik %s  als waarde)',
                fr: 'Réponse (utilisez %s  pour la valeur)',
                it: 'Risposta (usa %s  per valore)',
                es: 'Respuesta (use %s  para el valor)',
                pl: 'Odpowiedź (użyj wartości %s )',
                'zh-cn': '答案（将％s用作值）',
            },
            default: {
                en: '%s',
                de: '%s',
                ru: '%s',
            },
        },
    },
    buildAnswer: {
        icon: '',
        name: {
            en: 'Create answer',
            de: 'Antwort erzeugen',
            ru: 'Создать ответ',
            pt: 'Criar resposta',
            nl: 'Creëer antwoord',
            fr: 'Créer une réponse',
            it: 'Crea una risposta',
            es: 'Crear respuesta',
            pl: 'Utwórz odpowiedź',
            'zh-cn': '建立答案',
        },
        unique: false,
        ack: {
            type: 'text',
            name: {
                en: 'Answer (use {objectID} for value)',
                de: 'Antwort ({objectID} wird mit Wert ersetzt)',
                ru: 'Ответ ({objectID} заменится значением)',
                pt: 'Resposta (use {objectID} como valor)',
                nl: 'Antwoord (gebruik {objectID} voor waarde)',
                fr: 'Réponse (utilisez {objectID} pour la valeur)',
                it: 'Risposta (usa {objectID} per valore)',
                es: 'Respuesta (use {objectID} para el valor)',
                pl: 'Odpowiedź (użyj {objectID} dla wartości)',
                'zh-cn': '答案（使用{objectID}作为值）',
            },
            default: {
                en: '{objectID}',
                de: '{objectID}',
                ru: '{objectID}',
            },
        },
    },
    goodBoy: {
        icon: '',
        name: {
            en: 'You are good',
            de: 'Du bist gut',
            ru: 'Молодец',
            pt: 'Você é bom',
            nl: 'Jij bent goed',
            fr: 'Tu es bon',
            it: 'Sei bravo',
            es: 'Eres bueno',
            pl: 'Jesteś dobry',
            'zh-cn': '你很好'
        },
        invisible: true,
        unique: true,
        words: {
            en: 'good',
            de: 'gut',
            ru: 'молодец/хорошая/хороший',
        },
        ack: {
            type: 'text',
            name: {
                en: 'Answer',
                de: 'Antwort',
                ru: 'Ответ',
                pt: 'Responda',
                nl: 'Antwoord',
                fr: 'Répondre',
                it: 'Risposta',
                es: 'Responder',
                pl: 'Odpowiedź',
                'zh-cn': '回答'
            },
            default: {
                en: 'Thank you/You are welcome',
                de: 'Danke/Freut mich',
                ru: 'Спасибо',
                pt: 'Obrigado / De nada',
                nl: 'Bedankt graag gedaan',
                fr: 'Merci derien',
                it: 'Grazie, prego',
                es: 'Gracias / de nada',
                pl: 'Dziękuję nie ma za co',
                'zh-cn': '谢谢不用谢'
            },
        },
    },
    thankYou: {
        icon: '',
        name: {
            en: 'Thank you',
            de: 'Danke',
            ru: 'Спасибо',
            pt: 'Obrigado',
            nl: 'Dank u',
            fr: 'Je vous remercie',
            it: 'Grazie',
            es: 'Gracias',
            pl: 'Dziękuję Ci',
            'zh-cn': '谢谢'
        },
        invisible: true,
        unique: true,
        words: {
            en: 'thank',
            de: 'danke',
            ru: 'спасибо',
            pt: 'obrigado',
            nl: 'dank',
            fr: 'remercier',
            it: 'grazie',
            es: 'gracias',
            pl: 'podziękować',
            'zh-cn': '谢谢'
        },
        ack: {
            type: 'text',
            name: {
                en: 'Answer',
                de: 'Antwort',
                ru: 'Ответ',
                pt: 'Responda',
                nl: 'Antwoord',
                fr: 'Répondre',
                it: 'Risposta',
                es: 'Responder',
                pl: 'Odpowiedź',
                'zh-cn': '回答'
            },
            default: {
                en: 'No problem/You are welcome',
                de: 'Kein Problem/Bitte/Bitte sehr',
                ru: 'Пожалуйста/Всегда пожалуйста/Не за что/С радостью',
                pt: 'Sem problemas/De nada',
                nl: 'Geen probleem graag gedaan',
                fr: 'Pas de problème/vous êtes les bienvenus',
                it: 'Nessun problema/Prego',
                es: 'No hay problema, de nada',
                pl: 'Nie ma sprawy, proszę bardzo',
                'zh-cn': '没问题/不客气'
            },
        },
    },
};

function findMatched(cmd, _rules) {
    const matchedRules = [];
    cmd = cmd
        .toLowerCase()
        .replace(/[#''$&/\\!?.,;:(){}^]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    let ix = cmd.indexOf(';');
    if (ix !== -1) {
        cmd = cmd.substring(ix + 1);
    }

    ix = cmd.indexOf('[');
    if (ix !== -1) {
        cmd = cmd.substring(0, ix);
    }

    const cmdWords = cmd.split(' ');

    for (let r = 0; r < _rules.length; r++) {
        const rule = _rules[r];
        if (!rule.words) {
            continue;
        }

        let isFound = true;

        // split rule words one time
        if (typeof rule.words === 'string') {
            // if regex
            if (rule.words[0] === '/') {
                rule.words = new RegExp(rule.words.slice(1, -1), 'i');
            } else {
                rule.words = rule.words.toLowerCase().trim().split(/\s+/g);
            }
        }

        // if regexp
        if (rule.words instanceof RegExp) {
            isFound = rule.words.test(cmd);
        } else {
            // compare every word
            for (let j = 0; j < rule.words.length; j++) {
                if (!rule.words[j]) {
                    continue;
                }

                if (rule.words[j].includes('/')) {
                    rule.words[j] = rule.words[j].split('/');
                }

                if (typeof rule.words[j] === 'string' && rule.words[j][0] === '[') {
                    continue;
                }

                // if one of
                if (typeof rule.words[j] === 'object') {
                    if (!rule.words[j].find(w => cmdWords.includes(w))) {
                        isFound = false;
                        break;
                    }
                } else if (!cmdWords.includes(rule.words[j])) {
                    isFound = false;
                    break;
                }
            }
        }

        if (isFound) {
            matchedRules.push(r);
            if (rule._break) {
                break;
            }
        }
    }

    return matchedRules;
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = {
        commands,
        findMatched,
    };
} else if (typeof window !== 'undefined') {
    window.commands = commands;
    window.findMatched = findMatched;
}
