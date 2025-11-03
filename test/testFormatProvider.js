'use strict';

var expect = require('chai').expect;
//var setup  = require(__dirname + '/lib/setup');
var formatProvider = require(__dirname + '/../lib/formatProvider');
var debug = true;

describe('Commands: Test dateInterval without suffix in default language', function () {
    it('must return 2 minutes and 20 seconds', function (done) {
        let out = formatProvider.formatInterval(new Date().getTime() - 2 * 60 * 1000 - 20 * 1000);
        if (debug) console.log('formatInterval returned: ' + out);
        expect(out).is.equal('2 minutes and 20 seconds');
        done();
    });

    it('must return 7 Minuten', function (done) {
        formatProvider.setLanguage('de');
        let out = formatProvider.formatInterval(new Date().getTime() - 7 * 60 * 1000 - 20 * 1000);
        if (debug) console.log('formatInterval returned: ' + out);
        expect(out).is.equal('7 Minuten');
        done();
    });
});

describe('Commands: Test dateInterval with suffix in german language', function () {
    it('must return vor 3 Stunden und 2 Minuten', function (done) {
        let out = formatProvider.formatInterval(
            new Date().getTime() - 3 * 60 * 60 * 1000 - 2 * 60 * 1000 - 20 * 1000,
            true,
            'de',
        );
        if (debug) console.log('formatInterval returned: ' + out);
        expect(out).is.equal('vor 3 Stunden und 2 Minuten');
        done();
    });

    it('must return vor 5 Tagen', function (done) {
        let out = formatProvider.formatInterval(
            new Date().getTime() - 5 * 24 * 60 * 60 * 1000 - 7 * 60 * 1000 - 20 * 1000,
            true,
            'de',
        );
        if (debug) console.log('formatInterval returned: ' + out);
        expect(out).is.equal('vor 5 Tagen');
        done();
    });

    it('must return vor einem Tag', function (done) {
        let out = formatProvider.formatInterval(
            new Date().getTime() - 1 * 24 * 60 * 60 * 1000 - 7 * 60 * 1000 - 20 * 1000,
            true,
            'de',
        );
        if (debug) console.log('formatInterval returned: ' + out);
        expect(out).is.equal('vor einem Tag');
        done();
    });
});
