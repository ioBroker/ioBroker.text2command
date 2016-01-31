![Logo](admin/text2command.png)
ioBroker text2command adapter
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.text2command.svg)](https://www.npmjs.com/package/iobroker.text2command)
[![Downloads](https://img.shields.io/npm/dm/iobroker.text2command.svg)](https://www.npmjs.com/package/iobroker.text2command)

[![NPM](https://nodei.co/npm/iobroker.text2command.png?downloads=true)](https://nodei.co/npm/iobroker.text2command/)

This adapter can convert normal sentences, like *'Switch light in kitchen on'* to specific command and sets the state *'adapter.0.device.kitchenLight'* to **true**.

To execute command, write state **text2command.<INSTANCE>.text** with sentence.

You can send a message via messagebox from javascript. The answer will come in the message too:

```
sendTo('text2command', 'Switch light in kitchen on', function (err, response) {
    console.log('Response is: ' + response);
});
```


## Changelog


### 0.0.1 (2015-07-29)
* (bluefox) initial commit

## Install

```iobroker add text2command```
