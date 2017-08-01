/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

// Translations for rooms, used for detection
var rooms = {
    "everywhere":                               {"ru" : "везде/весь/все/всё",     "de": "alle/überall",         "en": "everywhere" },
    "livingroom/wohnzimmer/зал":                {"ru" : "зал",                    "de": "wohnzimmer",           "en": "living" },
    "bedroom/sleepingroom/schlafzimmer/спальня":{"ru" : "спальн",                 "de": "schlafzimmer",         "en": "bedroom" },
    "bathroom/bath/badezimmer/bad/ванная":      {"ru" : "ванн",                   "de": "bad",                  "en": "bath" },
    "office/arbeitszimmer/кабинет":             {"ru" : "кабинет",                "de": "arbeitszimmer/kabinet/büro","en": "working/office" },
    "nursery/kinderzimmer/детская":             {"ru" : "детск",                  "de": "kinder",               "en": "kids/child/nursery" },
    "guestwc/gästewc/гостевойтуалет":           {"ru" : "гостевой туалет/гостевом туалет", "de": "gäste wc",    "en": "guets wc/guest closet" },
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
    "heatroom/heatingroom/heizungsraum/котельная": {"ru" : "котельн",             "de": "heizungsraum",         "en": "heat room/heating room" },
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
    "guestwc/gästewc/гостевойтуалет":           {"ru" : "в гостевом туалете", "de": "im gäste wc",    "en": "in guets wc" },
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
    "heatroom/heatingroom/heizungsraum/котельная": {"ru" : "в котельной",  "de": "im Heizungsraum",   "en": "in the heat room" },
    "hovel/schuppen/scheune/сарай":             {"ru" : "в сарае",      "de": "im Schuppen",          "en": "in the hovel" },
    "summerhouse/gartenhaus/теплица":           {"ru" : "в теплице",    "de": "im Gartenhaus",        "en": "in the summer house" }
};

module.exports = {
    rooms:          rooms,
    roomsDative:    roomsDative
};
