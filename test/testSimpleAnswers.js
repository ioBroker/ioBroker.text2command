'use strict';

const assert = require('node:assert');
const { getRandomPhrase } = require('../build/lib/simpleAnswers');

describe('Commands: Test getRandomPhrase', function () {
    it('must convert literal \\n into a new line', function () {
        assert.strictEqual(getRandomPhrase('Line1\\nLine2'), 'Line1\nLine2');
    });

    it('must convert literal \\n in alternatives', function () {
        for (let i = 0; i < 20; i++) {
            const out = getRandomPhrase('A\\nB/C\\nD');
            assert.ok(out === 'A\nB' || out === 'C\nD', `Unexpected result: ${JSON.stringify(out)}`);
        }
    });

    it('must convert literal \\n in array alternatives', function () {
        assert.strictEqual(getRandomPhrase(['X\\nY']), 'X\nY');
    });

    it('must return empty string for null or undefined', function () {
        assert.strictEqual(getRandomPhrase(null), '');
        assert.strictEqual(getRandomPhrase(undefined), '');
    });
});
