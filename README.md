![Logo](admin/text2command.png)
ioBroker text2command adapter
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.text2command.svg)](https://www.npmjs.com/package/iobroker.text2command)
[![Downloads](https://img.shields.io/npm/dm/iobroker.text2command.svg)](https://www.npmjs.com/package/iobroker.text2command)

[![NPM](https://nodei.co/npm/iobroker.text2command.png?downloads=true)](https://nodei.co/npm/iobroker.text2command/)

This adapter can convert normal sentences, like *'Switch light in kitchen on'* to specific command and sets the state *'adapter.0.device.kitchenLight'* to **true**.

To execute command, write state **text2command.<INSTANCE>.text** with sentence. You will always get the answer in **text2command.<INSTANCE>.response**.

If you define **Answer to ID**, the answer will be written in this ID too. This required for e.g. to realise the voice 

You can send a message via messagebox from javascript. The answer will come in the message too:

```
sendTo('text2command', 'Switch light in kitchen on', function (err, response) {
    console.log('Response is: ' + response);
});
```

To use "Switch on/off by function" you should care of functions. 

Following functions will be interpreted as 

**light** (Licht | Свет):
- level.dimmer
- switch.light

**backlight** (Beleuchtung | Подсветка):
- level.backlight
- switch.backlight

**blinds/shutter** (Rolladen | Жалюзи/окна)
- level.blind
- switch.blind

**curtain** (Vorhänge | Шторы)
- level.curtain
- switch.curtain

**heating** (Heizung | Отопление/Подогрев)
- level.temperature
- switch.temperature

**music** (Musik | Музыка)
- button.play
- button.stop / button.pause

**Alarm/Security** (Alarmanlage / Alarm | Охрана)
- switch.security

**lock** (Schloß / Schloss | Замок)
- switch.open
- switch.lock

Following rooms are supported:



You can define default room in []. E.g "switch the light on[sleepingroom]
## Changelog

### 0.0.1 (2015-07-29)
* (bluefox) initial commit

## Install

```iobroker add text2command```
