var expect = require('chai').expect;
//var setup  = require(__dirname + '/lib/setup');
var simpleControl = require(__dirname + '/../lib/simpleControl');
var debug = true;

var adapter = {
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
        if (id == 'temperatureC') {
            cb(null, {
                _id: 'temperatureC',
                common: {
                    units: '°C'
                }
            });
        } else if (id == 'temperatureF') {
            cb(null, {
                _id: 'temperatureF',
                common: {
                    units: '°F'
                }
            });
        } else if (id == 'temperatureNone') {
            cb(null, {
                _id: 'temperatureNone',
                common: {
                }
            });
        } else if (id == 'someSwitch') {
            cb(null, {
                _id: 'someSwitch',
                common: {
                    name: 'some switch',
                    units: '%'
                },
                type: 'state'
            });
        } else {
            cb('not found');
        }
    },
    setForeignState: function (id, value, cb) {
        cb(null);
    },
    getForeignState: function (id, cb) {
        cb(null, {val: 15});
    }
};
var systemConfig = {
    tempUnit: '°F'
};

simpleControl.init(adapter, systemConfig);

describe('Test time', function () {
    it('must return current time', function (done) {
        simpleControl.sayTime(null, null, null, null, function (text) {
            if (debug) console.log('sayTime returned: ' + text);
            expect(text).to.be.ok;
            expect(text).has.length(5);
            expect(text[2]).is.equal(':');
            expect(parseInt(text.substring(0, 2), 10).toString()).to.be.equal(text.substring(0, 2).replace(/^0/, ''));
            expect(parseInt(text.substring(3, 5), 10).toString()).to.be.equal(text.substring(3, 5).replace(/^0/, ''));
            done();
        });
    });
});

describe('Test name', function () {
    it('must return no name in english', function (done) {
        simpleControl.sayName('en', null, null, null, function (text) {
            if (debug) console.log('sayName(en) returned: ' + text);
            expect(text).to.be.ok;
            done();
        });
    });

    it('must return no name in german', function (done) {
        simpleControl.sayName('de', null, null, null, function (text) {
            if (debug) console.log('sayName(de) returned: ' + text);
            expect(text).to.be.ok;
            done();
        });
    });

    it('must return no name in russian', function (done) {
        simpleControl.sayName('ru', null, null, null, function (text) {
            if (debug) console.log('sayName(ru) returned: ' + text);
            expect(text).to.be.ok;
            done();
        });
    });

    it('must return name', function (done) {
        simpleControl.sayName('en', null, null, '1/2/3', function (text) {
            if (debug) console.log('sayName(1/2/3) returned: ' + text);
            expect(text).to.be.ok;
            expect(parseInt(text, 10)).to.be.above(0);
            expect(parseInt(text, 10)).to.be.below(4);
            done();
        });
    });


});

describe('Test temperature', function () {
    it('must say temperature in english and celsius', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(en, C) returned: ' + text);
            expect(text.indexOf('15 degrees celsius')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in german and celsius', function (done) {
        simpleControl.sayTemperature('de', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(de, C) returned: ' + text);
            expect(text.indexOf('15 grad Celsius')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in russian and celsius', function (done) {
        simpleControl.sayTemperature('ru', null, ['temperatureC'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(ru, C) returned: ' + text);
            expect(text.indexOf('15 градусов целсия')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in english and fahrenheit', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(en, F) returned: ' + text);
            expect(text.indexOf('15 degrees fahrenheit')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in german and fahrenheit', function (done) {
        simpleControl.sayTemperature('de', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(de, F) returned: ' + text);
            expect(text.indexOf('15 grad Fahrenheit')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in russian and fahrenheit', function (done) {
        simpleControl.sayTemperature('ru', null, ['temperatureF'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(ru, F) returned: ' + text);
            expect(text.indexOf('15 градусов по фаренгейту')).to.be.least(0);
            done();
        });
    });
    it('must say temperature in english with default units', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureNone'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(en, Default) returned: ' + text);
            expect(text.indexOf('15 degrees fahrenheit')).to.be.least(0);
            done();
        });
    });
    it('must say temperature dont know', function (done) {
        simpleControl.sayTemperature('en', null, ['temperatureNone1'], '%s %u/a %s %u/b %s %u', function (text) {
            if (debug) console.log('sayTemperature(en, unknownId) returned: ' + text);
            expect(text.indexOf('degrees')).to.be.below(0);
            expect(text).to.be.ok;
            done();
        });
    });
});

describe('Test userQuery', function () {
    it('must return temperature on query', function (done) {
        simpleControl.userQuery('en', null, ['temperatureC'], '%s grad/a %s grad/b %s grad', function (text) {
            if (debug) console.log('userQuery(temperatureC) returned: ' + text);
            expect(text.indexOf('15 grad')).to.be.at.least(0);
            done();
        });
    });

    it('must return temperature on query', function (done) {
        simpleControl.userQuery('en', null, ['temperatureC'], '%s %u/a %s %u /b %s %u', function (text) {
            if (debug) console.log('userQuery(temperatureC, %u) returned: ' + text);
            expect(text.indexOf('15 °C')).to.be.at.least(0);
            done();
        });
    });

    it('must return temperature on query', function (done) {
        simpleControl.userQuery('en', null, ['unknown'], '%s %u/a %s %u /b %s %u', function (text) {
            if (debug) console.log('userQuery(unknown) returned: ' + text);
            expect(text).to.be.not.ok;
            done();
        });
    });
});

describe('Test device control', function () {
    it('must control device with predefined value', function (done) {
        simpleControl.userDeviceControl('en', null, ['someSwitch', 'true'], 'Value %s written', function (text) {
            if (debug) console.log('userDeviceControl(someSwitch) returned: ' + text);
            expect(text).to.be.ok;
            expect(text.indexOf('Value true written')).to.be.at.least(0);
            done();
        });
    });
    it('must control device with variable value', function (done) {
        simpleControl.userDeviceControl('en', 'control 60.5% value', ['someSwitch'], '%n %s%u written', function (text) {
            if (debug) console.log('userDeviceControl(someSwitch, 60.5%) returned: ' + text);
            expect(text).to.be.ok;
            expect(text.indexOf('some switch 60% written')).to.be.at.least(0);
            done();
        });
    });
    it('must not return any ack text', function (done) {
        simpleControl.userDeviceControl('en', 'control 60.5% value', ['someSwitch'], '', function (text) {
            if (debug) console.log('userDeviceControl(someSwitch, no ack) returned: ' + text);
            expect(text).to.be.not.ok;
            done();
        });
    });
});
