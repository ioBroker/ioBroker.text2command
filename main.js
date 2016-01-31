// structure of rule
// {
//     description: '',
//     template: 'templateName'
//     words: 'key words option1/option2/option3 option* option_'
//     groups: ['enum.functions.light', 'enum.rooms.kitchen']
//     ack: true/false (If acknowledge must be written into .text back
//     unique
//     editable
//
//

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils   = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('text2command');

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack && state.val) {
        if (id == adapter.namespace + '.text') {
            processText(state.val.toString());
        }
    }
});

adapter.on('ready', function () {
    main();
    adapter.subscribeStates(adapter.namespace + '.text');
});

var rules;

// Check if actual states are exactly as desired in the scene
function checkRule(rule, text, options) {
    return false;
}

function processText(text) {
    for (var r = 0; r < rules.length; r++) {
        if (checkRule(rules[r], text)) break;
    }
}

function main() {
    rules = adapter.config.rules || {};

    // do nothing, just wait for text2command.X.text
}

