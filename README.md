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
- enum.functions: 

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
---------------------------------------------------------------------------------------------------------------
| key word in phrase    | Possible enum.rooms in english  | in german                | in russian             |
---------------------------------------------------------------------------------------------------------------
| everywhere            | everywhere                      | -                        | -                    
| living                | livingroom                      | wohnzimmer               | зал             
| bedroom               | bedroom/sleepingroom            | schlafzimmer             | спальня
| bath                  | bathroom/bath                   | badezimmer/bad           | ванная     
| working/office        | office                          | arbeitszimmer            | кабинет            
| kids/child/nursery    | nursery                         | kinderzimmer             | детская            
| guets wc/guest closet | guestwc                         | gästewc                  | гостевойтуалет
| wc/closet             | wc                              | wc                       | туалет                  
| floor/enter           | floor                           | diele/gang/flur          | коридор/прихожая
| kitchen               | kitchen                         | küche/kueche             | кухня    
| balcony/terrace/patio | terrace                         | balkon/terrasse          | терасса/балкон
| dinning               | dinningroom                     | esszimmer                | столовая
| garage                | garage                          | garage                   | гараж
| stair                 | stairs                          | trepe/treppenhaus        | лестница
| garden                | garden                          | garten                   | сад
| court/yard            | court                           | hof                      | двор      
| guest room            | guestroom                       | gästezimmer              | гостевая 
| attic                 | attic                           | speicher                 | кладовка   
| roof                  | roof                            | dachstuhl                | крыша      
| terminal              | terminal                        | anschlussraum            | сени         
| wash room             | washroom                        | waschraum                | прачечная 
| heat room             | heatroom                        | heatingroom/heizungsraum | котельная
| hovel                 | hovel                           | schuppen/scheune         | сарай   
| summer house          | summerhouse                     | gartenhaus               | теплица
-------------------------------------------------------------------------------------------------------------

You can define default room in []. E.g "switch the light on[sleepingroom]"

You can use patterns: 
- %s : value
- %u : unit
- %n : name (planned!)

## Changelog

### 0.0.1 (2015-07-29)
* (bluefox) initial commit

## Install

```iobroker add text2command```
