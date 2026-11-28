'use strict';

const assert = require('node:assert');
const devicesControl = require('../build/lib/devicesControl');
const testData = require('./lib/testData.json');

let writtenId;
let writtenValue;

function enumObj(id, members) {
    return { _id: id, type: 'enum', common: { name: id.split('.').pop(), members }, native: {} };
}

const enums = {
    'enum.rooms': {
        // floor with room as subgroup
        'enum.rooms.EG': enumObj('enum.rooms.EG', []),
        'enum.rooms.EG.living_room': enumObj('enum.rooms.EG.living_room', [
            'hm-rpc.0.blind1.1.LEVEL',
            'hm-rpc.0.light1.1.STATE',
        ]),
        // floor with room as member
        'enum.rooms.OG': enumObj('enum.rooms.OG', ['enum.rooms.Bad']),
        'enum.rooms.Bad': enumObj('enum.rooms.Bad', ['enum.rooms.Dusche']),
        // circular reference must not lead to an endless loop
        'enum.rooms.Dusche': enumObj('enum.rooms.Dusche', ['hm-rpc.0.light2.1.STATE', 'enum.rooms.Bad']),
    },
    'enum.functions': {
        'enum.functions.blinds': enumObj('enum.functions.blinds', ['hm-rpc.0.blind1.1.LEVEL']),
        'enum.functions.light': enumObj('enum.functions.light', [
            'hm-rpc.0.light1.1.STATE',
            'hm-rpc.0.light2.1.STATE',
        ]),
    },
};

const adapter = {
    log: {
        warn: txt => console.warn(txt),
        debug: txt => console.log(txt),
        info: txt => console.log(txt),
        error: txt => console.error(txt),
    },
    getForeignObject: function (id, cb) {
        const isBlind = id.includes('blind');
        cb(null, {
            _id: id,
            common: {
                name: id,
                type: isBlind ? 'number' : 'boolean',
                role: isBlind ? 'level.blind' : 'switch.light',
                min: isBlind ? 0 : undefined,
                max: isBlind ? 100 : undefined,
            },
            type: 'state',
        });
    },
    setForeignState: function (id, value, cb) {
        writtenId = id;
        writtenValue = value;
        cb(null);
    },
    getForeignState: function (id, cb) {
        cb(null, { val: 15 });
    },
};

describe('Commands: Nested enums (rooms in floors)', function () {
    before(() => devicesControl.init(enums, adapter));
    after(() => devicesControl.init(testData, adapter));
    beforeEach(() => {
        writtenId = undefined;
        writtenValue = undefined;
    });

    it('Blinds rule must find the room as subgroup of a floor', function (done) {
        devicesControl.controlBlinds('en', 'shutter in the living room 70', [], true, function (response) {
            assert.strictEqual(response, 'Open the shutter in the living room on 70 percent');
            assert.strictEqual(writtenId, 'hm-rpc.0.blind1.1.LEVEL');
            assert.strictEqual(writtenValue, 70);
            done();
        });
    });

    it('On/Off by function must find the room as subgroup of a floor', function (done) {
        devicesControl.controlByFunction('de', 'schalte licht im wohnzimmer an', [], true, function (response) {
            assert.strictEqual(response, 'Schalte das Licht im Wohnzimmer ein');
            assert.strictEqual(writtenId, 'hm-rpc.0.light1.1.STATE');
            assert.strictEqual(writtenValue, true);
            done();
        });
    });

    it('On/Off by function must find devices of a room enum used as member', function (done) {
        devicesControl.controlByFunction('en', 'switch light in bath off', [], true, function (response) {
            assert.strictEqual(response, 'Switch off light in the bath');
            assert.strictEqual(writtenId, 'hm-rpc.0.light2.1.STATE');
            assert.strictEqual(writtenValue, false);
            done();
        });
    });
});
