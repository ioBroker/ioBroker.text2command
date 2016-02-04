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
    tempUnit: '°C'
};

simpleControl.init(adapter, systemConfig);

describe('Test time', function() {
    it('must return current time', function (done) {
        simpleControl.sayTime(null, null, null, null, function (text) {
            if (debug) console.log('sayTime returned: ' + text);
            expect(text).to.be.ok;
            expect(text).has.length(5);
            expect(text[2]).is.equal(':');
            expect(parseInt(text.substring(0, 2), 10).toString()).to.be.equal(text.substring(0, 2));
            expect(parseInt(text.substring(3, 5), 10).toString()).to.be.equal(text.substring(3, 5));
            done();
        });
    });
});

describe('Test name', function() {
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

describe('Test temperature', function() {
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
            expect(text.indexOf('15 degrees celsius')).to.be.least(0);
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