'use strict';

const expect = require('chai').expect;
//const setup  = require(__dirname + '/lib/setup');
const extractBinding = require('../lib/simpleControl')._extractBinding;

const samples = [
    {
        name: 'Simple val',
        format: '{adapter.0.state}',
        results: [
            {
                systemOid: 'adapter.0.state',
                visOid: 'adapter.0.state.val',
                isSeconds: false,
                operations: undefined,
                token: '{adapter.0.state}',
            },
        ],
    },
    {
        name: 'Double val',
        format: '{adapter.0.state1}x{adapter.0.state2}',
        results: [
            {
                systemOid: 'adapter.0.state1',
                visOid: 'adapter.0.state1.val',
                isSeconds: false,
                operations: undefined,
                token: '{adapter.0.state1}',
            },
            {
                systemOid: 'adapter.0.state2',
                visOid: 'adapter.0.state2.val',
                isSeconds: false,
                operations: undefined,
                token: '{adapter.0.state2}',
            },
        ],
    },
    {
        name: 'Simple ts',
        format: '{adapter.0.state.ts}',
        results: [
            {
                systemOid: 'adapter.0.state',
                visOid: 'adapter.0.state.ts',
                isSeconds: true,
                operations: undefined,
                token: '{adapter.0.state.ts}',
            },
        ],
    },
    {
        name: 'Simple val 2',
        format: '{adapter.0.state.val}',
        results: [
            {
                systemOid: 'adapter.0.state',
                visOid: 'adapter.0.state.val',
                isSeconds: false,
                operations: undefined,
                token: '{adapter.0.state.val}',
            },
        ],
    },
    {
        name: 'Complex val 2',
        format: '{adapter.0.state.val:a; a*10}',
        results: [
            {
                systemOid: 'a',
                visOid: 'a.val',
                isSeconds: false,
                operations:
                    '[{"op":"eval","arg":[{"name":"adapter.0.state.val","visOid":"a.val","systemOid":"a"}],"formula":" a*10"}]',
                token: '{adapter.0.state.val:a; a*10}',
            },
        ],
    },
];

describe('Extract bindings', function () {
    samples.forEach(test => {
        it(test.name, done => {
            const results = extractBinding(test.format);
            expect(results.length).to.be.equal(test.results.length);
            results.forEach((result, i) => {
                expect(result.systemOid).to.be.equal(test.results[i].systemOid);
                expect(result.visOid).to.be.equal(test.results[i].visOid);
                expect(result.isSeconds).to.be.equal(test.results[i].isSeconds);
                if (test.results[i].operations) {
                    expect(JSON.stringify(result.operations)).to.be.equal(test.results[i].operations);
                } else {
                    expect(result.operations).to.be.equal(test.results[i].operations);
                }
                expect(result.token).to.be.equal(test.results[i].token);
                expect(result.format).to.be.equal(test.format);
            });
            done();
        });
    });
});
