'use strict';

const assert = require('node:assert');
const simpleControl = require('../build/lib/simpleControl');
const debug = true;
let writtenValue;

const adapter = {
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
        },
    },
    getForeignObject: function (id, cb) {
        if (id === 'temperatureC') {
            cb(null, {
                _id: 'temperatureC',
                common: {
                    role: 'value.temperature',
                    unit: '°C',
                },
            });
        } else if (id === 'temperatureF') {
            cb(null, {
                _id: 'temperatureF',
                common: {
                    role: 'value.temperature',
                    unit: '°F',
                },
            });
        } else if (id === 'temperatureNone') {
            cb(null, {
                _id: 'temperatureNone',
                common: {},
            });
        } else if (id === 'someSwitch') {
            cb(null, {
                _id: 'someSwitch',
                common: {
                    name: 'some switch',
                    unit: '%',
                    type: 'boolean',
                },
                type: 'state',
            });
        } else if (id === 'someLevel') {
            cb(null, {
                _id: 'someLevel',
                common: {
                    name: 'some Level',
                    unit: '%',
                    type: 'number',
                },
                type: 'state',
            });
        } else {
            cb('not found');
        }
    },
    getForeignObjectAsync: function (id) {
        if (id === 'temperatureC') {
            return Promise.resolve({
                _id: 'temperatureC',
                common: {
                    role: 'value.temperature',
                    unit: '°C',
                },
            });
        } else if (id === 'temperatureF') {
            return Promise.resolve({
                _id: 'temperatureF',
                common: {
                    role: 'value.temperature',
                    unit: '°F',
                },
            });
        } else if (id === 'temperatureNone') {
            return Promise.resolve({
                _id: 'temperatureNone',
                common: {},
            });
        } else if (id === 'someSwitch') {
            return Promise.resolve({
                _id: 'someSwitch',
                common: {
                    name: 'some switch',
                    unit: '%',
                    type: 'boolean',
                },
                type: 'state',
            });
        } else if (id === 'someLevel') {
            return Promise.resolve({
                _id: 'someLevel',
                common: {
                    name: 'some Level',
                    unit: '%',
                    type: 'number',
                },
                type: 'state',
            });
        } else {
            return Promise.reject('not found');
        }
    },
    setForeignState: function (id, value, cb) {
        writtenValue = value;
        typeof cb === 'function' && cb(null);
    },
    setState: function (id, value, cb) {
        typeof cb === 'function' && cb(null);
    },
    getForeignState: function (id, cb) {
        cb(null, { val: 15 });
    },
    getForeignStateAsync: function (id, cb) {
        return Promise.resolve({ val: 15 });
    },
};
let systemConfig = {
    tempUnit: '°F',
};

simpleControl.init(systemConfig, adapter);

describe('Commands: Test time', function () {
    it('must return current time', function (done) {
        simpleControl.sayTime(null, null, null, null, function (text) {
            debug && console.log('sayTime returned: ' + text);
            assert.ok(text);
            assert.strictEqual(text.length, 5);
            assert.strictEqual(text[2], ':');
            assert.strictEqual(parseInt(text.substring(0, 2), 10).toString(), text.substring(0, 2).replace(/^0/, ''));
            assert.strictEqual(parseInt(text.substring(3, 5), 10).toString(), text.substring(3, 5).replace(/^0/, ''));
            done();
        });
    });
});

describe('Commands: Test name', function () {
    it('must return no name in english', function (done) {
        simpleControl.sayName('en', null, null, null, function (text) {
            debug && console.log('sayName(en) returned: ' + text);
            assert.ok(text);
            done();
        });
    });

    it('must return no name in german', function (done) {
        simpleControl.sayName('de', null, null, null, function (text) {
            debug && console.log('sayName(de) returned: ' + text);
            assert.ok(text);
            done();
        });
    });

    it('must return no name in russian', function (done) {
        simpleControl.sayName('ru', null, null, null, function (text) {
            debug && console.log('sayName(ru) returned: ' + text);
            assert.ok(text);
            done();
        });
    });

    it('must return name', function (done) {
        simpleControl.sayName('en', null, null, '1/2/3', function (text) {
            debug && console.log('sayName(1/2/3) returned: ' + text);
            assert.ok(text);
            assert.ok(parseInt(text, 10) > 0);
            assert.ok(parseInt(text, 10) < 4);
            done();
        });
    });
});

describe('Commands: Test temperature', function () {
    it('must say temperature in english and celsius', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(en, C) returned: ' + text);
            assert.ok(text.indexOf('15 degrees') >= 0);
            done();
        });
    });
    it('must say temperature in german and celsius', function (done) {
        simpleControl.sayTemperature('de', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(de, C) returned: ' + text);
            assert.ok(text.indexOf('15 Grad') >= 0);
            done();
        });
    });
    it('must say temperature in russian and celsius', function (done) {
        simpleControl.sayTemperature('ru', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(ru, C) returned: ' + text);
            assert.ok(text.indexOf('15 градусов') >= 0);
            done();
        });
    });
    it('must say temperature in english and fahrenheit', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(en, F) returned: ' + text);
            assert.ok(text.indexOf('15 degrees') >= 0);
            done();
        });
    });
    it('must say temperature in german and fahrenheit', function (done) {
        simpleControl.sayTemperature('de', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(de, F) returned: ' + text);
            assert.ok(text.indexOf('15 Grad') >= 0);
            done();
        });
    });
    it('must say temperature in russian and fahrenheit', function (done) {
        simpleControl.sayTemperature('ru', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(ru, F) returned: ' + text);
            assert.ok(text.indexOf('15 градусов') >= 0);
            done();
        });
    });
    it('must say temperature in english with default units', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureNone'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(en, Default) returned: ' + text);
            assert.ok(text.indexOf('15 degrees') >= 0);
            done();
        });
    });
    it('must say temperature dont know', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureNone1'], '%s %u/a %s %u/b %s %u', function (text) {
            debug && console.log('sayTemperature(en, unknownId) returned: ' + text);
            assert.ok(text.indexOf('degrees') < 0);
            assert.ok(text);
            done();
        });
    });
    it('must replace template with the value', function (done) {
        simpleControl.sayTemperature(
            'en',
            null,
            ['temperatureC'],
            '{system.adapter.text2command.alive} a {system.adapter.text2command.0.connected}',
            function (text) {
                debug && console.log('sayTemperature(en, C) returned: ' + text);
                assert.strictEqual(text, '15 a 15');
                done();
            },
        );
    });
});

describe('Commands: Build answer', function () {
    it('must replace bindings with the value', function (done) {
        simpleControl.buildAnswer(
            'en',
            null,
            null,
            '{a: system.adapter.text2command.alive; a * 2} a {system.adapter.text2command.0.connected;*(3)}',
            function (text) {
                debug && console.log('Build answer(en) returned: ' + text);
                assert.strictEqual(text, '30 a 45');
                done();
            },
        );
    });
});

describe('Commands: Test userQuery', function () {
    it('must return temperature on query', function (done) {
        simpleControl.userQuery('en', null, ['temperatureC'], '%s grad/a %s grad/b %s grad', text => {
            debug && console.log('userQuery(temperatureC) returned: ' + text);
            assert.ok(text.indexOf('15 grad') >= 0);
            done();
        });
    });

    it('must return temperature on query 1', function (done) {
        simpleControl.userQuery('en', null, ['temperatureC'], '%s %u/a %s %u /b %s %u', text => {
            debug && console.log('userQuery(temperatureC, %u) returned: ' + text);
            assert.ok(text.indexOf('15 degrees') >= 0);
            done();
        });
    });

    it('must return temperature on query 2', function (done) {
        simpleControl.userQuery('en', null, ['unknown'], '%s %u/a %s %u /b %s %u', text => {
            debug && console.log('userQuery(unknown) returned: ' + text);
            assert.strictEqual(text, 'Error. See logs.');
            done();
        });
    });
});

describe('Commands: Test device control', function () {
    it('must control device with predefined value', function (done) {
        simpleControl.userDeviceControl('en', null, ['someSwitch', 'true'], 'Value %s written', function (text) {
            debug && console.log('userDeviceControl(someSwitch) returned: ' + text);
            assert.strictEqual(writtenValue, true);
            assert.ok(text);
            assert.ok(text.indexOf('Value true written') >= 0);
            done();
        });
    });

    it('must control device with variable value 60.5', function (done) {
        simpleControl.userDeviceControl('en', 'control 60.5% value', ['someLevel'], '%n %s%u written', function (text) {
            debug && console.log('userDeviceControl(someSwitch, 60.5%) returned: ' + text);
            assert.strictEqual(writtenValue, 60.5);
            assert.ok(text);
            assert.ok(text.indexOf('some Level 60.5% written') >= 0);
            done();
        });
    });

    it('must control device with variable value -60', function (done) {
        simpleControl.userDeviceControl('en', 'control -60% value', ['someLevel'], '%n %s%u written', function (text) {
            debug && console.log('userDeviceControl(someSwitch, -60%) returned: ' + text);
            assert.strictEqual(writtenValue, -60);
            assert.ok(text);
            assert.ok(text.indexOf('some Level -60% written') >= 0);
            done();
        });
    });

    it('must control device with variable value +60,6', function (done) {
        simpleControl.userDeviceControl(
            'en',
            'control +60,6% value',
            ['someLevel'],
            '%n %s%u written',
            function (text) {
                debug && console.log('userDeviceControl(someSwitch, +60,6%) returned: ' + text);
                assert.strictEqual(writtenValue, 60.6);
                assert.ok(text);
                assert.ok(text.indexOf('some Level 60.6% written') >= 0);
                done();
            },
        );
    });

    it('must not return any ack text', function (done) {
        simpleControl.userDeviceControl('en', 'control 60.5% value', ['someSwitch'], '', function (text) {
            debug && console.log('userDeviceControl(someSwitch, no ack) returned: ' + text);
            assert.ok(!text);
            done();
        });
    });
});

describe('Commands: Test extract text', function () {
    it('Must return text except key words', function (done) {
        simpleControl.sendText(
            'en',
            simpleControl.extractText(
                'say to computer i will be back',
                'say to computer I will be back',
                'say [to] computer',
            ),
            ['someSwitch'],
            'Text: %s/Text: %s',
            function (text) {
                debug && console.log('userText(say to computer I will be late, someSwitch) returned: ' + text);
                assert.strictEqual(text, 'Text: I will be back');
                done();
            },
        );
    });
    it('Must return value except key words', function (done) {
        simpleControl.sendText(
            'en',
            simpleControl.extractText('say to computer active?', 'say to computer Active!', 'say [to] computer'),
            ['someSwitch'],
            'Text: %s/Text: %s',
            function (text) {
                debug && console.log('userText(say to computer Active!, someSwitch) returned: ' + text);
                assert.strictEqual(text, 'Text: active'); // someSwitch is boolean and active will be replaced with true
                done();
            },
        );
    });
    it('Must return text except key words', function (done) {
        simpleControl.sendText(
            'en',
            simpleControl.extractText(
                'позвать гаража aндрей ужин готов!',
                'позвать гаража Андрей ужин готов!',
                'позвать [из] гаража',
            ),
            ['someSwitch'],
            'Text: %s/Text: %s',
            function (text) {
                debug && console.log('userText(позвать гаража Андрей ужин готов!, someSwitch) returned: ' + text);
                assert.strictEqual(text, 'Text: Андрей ужин готов!');
                done();
            },
        );
    });
    it('Must return text except key words', function (done) {
        simpleControl.sendText(
            'en',
            simpleControl.extractText(
                'позвать из гаража aндрей ужин готов!',
                'позвать из гаража Андрей ужин готов!',
                'позвать [из] гаража',
            ),
            ['someSwitch'],
            'Text: %s/Text: %s',
            function (text) {
                debug && console.log('userText(позвать из гаража Андрей ужин готов!, someSwitch) returned: ' + text);
                assert.strictEqual(text, 'Text: Андрей ужин готов!');
                done();
            },
        );
    });
    it('Must return text except key words', function (done) {
        simpleControl.sendText(
            'en',
            simpleControl.extractText(
                'позвать из гаража aндрей ужин готов_',
                'позвать из гаража Андрей ужин готов!',
                'позвать из гаража',
            ),
            ['someSwitch'],
            'Text: %s/Text: %s',
            function (text) {
                debug && console.log('userText(позвать из гаража Андрей ужин готов!, someSwitch) returned: ' + text);
                assert.strictEqual(text, 'Text: Андрей ужин готов!');
                done();
            },
        );
    });
});
