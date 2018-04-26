'use strict';

const expect = require('chai').expect;
//var setup  = require(__dirname + '/lib/setup');
const devicesControl = require(__dirname + '/../lib/devicesControl');
const enums = require(__dirname + '/lib/testData.json');
const functions = require(__dirname + '/../lib/functions');
const rooms = require(__dirname + '/../lib/rooms');
let debug = true;
let writtenValue;

let adapter = {
    log: {
        warn: function (txt) {
            console.warn(txt);
        },
        debug: function (txt) {
            console.log(txt);
        },
        info: function (txt) {
            console.log(txt);
        },
        error: function (txt) {
            console.error(txt);
        }
    },
    getForeignObject: function (id, cb) {
        cb(null, {
            _id: id,
            common: {
                name: 'Test device 1',
                type: 'boolean',
                role: 'switch.light'
            },
            type: 'state'
        });
    },
    setForeignState: function (id, value, cb) {
        writtenValue = value;
        cb(null);
    },
    getForeignState: function (id, cb) {
        cb(null, {val: 15});
    }
};

devicesControl.init(enums, adapter);

function findRoom(text, lang) {
    var sRoom = '';
    for (var room in rooms.rooms) {
        var words = rooms.rooms[room][lang].split('/');
        for (var w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) != -1) {
                sRoom = room;
                break;
            }
        }
        if (sRoom) break;
    }

    return sRoom;
}

function findFunction(text, lang) {
    var sFunction = '';
    for (var _f in functions.functions) {
        var words = functions.functions[_f][lang].split('/');
        for (var w = 0; w < words.length; w++) {
            if (text.indexOf(words[w]) != -1) {
                sFunction = _f;
                break;
            }
        }
        if (sFunction) break;
    }

    return sFunction;
}

function testOne(lang, func, room, value) {
    var cmd;
    value = !!value;
    if (lang == 'de') {
        cmd = 'schalte ' + func + ' in ' + room + ' ' + (value ? 'an' : 'aus');
    } else if (lang == 'en') {
        cmd = 'switch ' + func + ' in ' + room + ' ' + (value ? 'on' : 'off');
    } else if (lang == 'ru') {
        cmd = (value ? 'включи' : 'выключи') + ' ' + func + ' в ' + room;
    }


    it('Must return: ' + cmd, function (done) {
        devicesControl.controlByFunction(lang, cmd, [], true, function (response) {
            if (debug) console.log('controlByFunction(cmd) returned: ' + response);
            var _room = findRoom(room, lang);
            var _func = findFunction(func, lang);
            if (lang == 'de') {
                expect(response).to.be.equal('Schalte ' + functions.functionsAccusative[_func][lang] + ' ' + rooms.roomsDative[_room][lang] + ' ' + (value ? 'ein' : 'aus'));
            } else if (lang == 'en') {
                expect(response).to.be.equal('Switch ' + (value ? 'on' : 'off') + ' ' + functions.functionsAccusative[_func][lang] + ' ' + rooms.roomsDative[_room][lang]);
            } else if (lang == 'ru') {
                expect(response).to.be.equal((value ? 'Включаю' : 'Выключаю') + ' ' + functions.functionsAccusative[_func][lang] + ' ' + rooms.roomsDative[_room][lang]);
            }
            expect(writtenValue).to.be.equal(value);
            done();
        });
    });
}

describe('Commands: Control by function', function () {
    it('Must return: Raum wurde nicht gefunden', function (done) {
        devicesControl.controlByFunction('de', 'schalte licht in wc an', [], true, function (response) {
            if (debug) console.log('controlByFunction(schalte licht in wc an) returned: ' + response);
            expect(response == 'Raum wurde nicht gefunden' || response == 'Es gibt kein Zimmer mit dem Namen'|| response == 'Man muss sagen in welchem Raum oder überall').to.be.true;
            done();
        });
    });
    it('Must return: room is not found', function (done) {
        devicesControl.controlByFunction('en', 'switch on the light in wc', [], true, function (response) {
            if (debug) console.log('controlByFunction(switch on the light in wc) returned: ' + response);
            expect((response == 'Room not found' || response == 'Room not present' || response == 'You don\'t have such a room')).to.be.true;
            done();
        });
    });
    it('Must return: Комната не найдена', function (done) {
        devicesControl.controlByFunction('ru', 'включи свет в туалете', [], true, function (response) {
            if (debug) console.log('controlByFunction(включи свет в туалете) returned: ' + response);
            expect((response === 'Комната не найдена' || response === 'Надо сказать в какой комнате или сказать везде')).to.be.true;
            done();
        });
    });

    it('Must return: Die Funktion wurde nicht gefunden', function (done) {
        devicesControl.controlByFunction('de', 'schalte liht in bad an', [], true, function (response) {
            if (debug) console.log('controlByFunction(schalte liht in wc an) returned: ' + response);
            expect(response == 'Die Funktion wurde nicht gefunden' ||
                   response == 'Es gibt keine Funktion mit dem Namen'||
                   response == 'Man muss sagen womit man was machen will').to.be.true;
            done();
        });
    });
    it('Must return: Function not present', function (done) {
        devicesControl.controlByFunction('en', 'switch on the ligt in bath', [], true, function (response) {
            if (debug) console.log('controlByFunction(switch on the ligt in bath) returned: ' + response);
            expect((response == 'Function not present' || response == 'Function not found' || response == 'You don\'t have such a device')).to.be.true;
            done();
        });
    });
    it('Must return: Устройство не найдено', function (done) {
        devicesControl.controlByFunction('ru', 'включи сет в ванной', [], true, function (response) {
            if (debug) console.log('controlByFunction(включи сет в туалете) returned: ' + response);
            expect((response === 'Устройство не найдено' || response === 'Надо сказать с чем произвести действие')).to.be.true;
            done();
        });
    });

    var cnt = 0;
    for (var f in functions.functions) {
        var func = functions.functions[f].de.split('/');
        cnt++;
        if (cnt > 3) break;

        for (var ff = 0; ff < func.length; ff++) {
            testOne('de', func[ff],  'bad', false);
            testOne('de', func[ff],  'bad', true);
        }
        func = functions.functions[f].en.split('/');
        for (var ff = 0; ff < func.length; ff++) {
            testOne('en', func[ff],  'bath', false);
            testOne('en', func[ff],  'bath', true);
        }
        func = functions.functions[f].ru.split('/');
        for (var ff = 0; ff < func.length; ff++) {
            testOne('ru', func[ff],  'ванной', false);
            testOne('ru', func[ff],  'ванной', true);
        }
    }
});
