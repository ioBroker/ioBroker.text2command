function Text2Commands() {
    var that            = this;

    this.list           = [];
    this.main           = main;
    this.currentFilter  = '';
    this.$dialogReplace = $('#dialog-replace');
    this.timer          = null;
    this.rules          = [];

    function installColResize() {
        if (!$.fn.colResizable) return;

        if ($('#grid-rules').is(':visible')) {
            $('#grid-rules').colResizable({
                liveDrag: true
            });
        } else {
            setTimeout(function () {
                installColResize();
            }, 400)
        }
    }

    function showArgument(index, argIndex, type, value) {
        var text = type ? '<input class="edit-field" data-index="' + index + '" data-field="args" data-args-index="' + argIndex + '" value="' + (value === undefined ? '' : value) + '" />' : '';
        switch (type) {
            case 'value': 
                break;
            
            case 'id': 
                break;
            
            default:
                break;
        }
        return text;
    }
    
    function showOneRule(index, rule) {
        var template = null;

        var text = '<tr>';
        // type
        text += '<td><select class="select-field" data-index="' + index + '" data-field="template">' +
            '<option value="">' + _('Select template') + '</option>';

        for (var r in commands) {
            var desc = commands[r].description;
            if (typeof desc === 'object') {
                desc = desc[systemLang] || desc.en;
            }

            if (rule.template === r) {
                text += '<option selected value="' + r + '">' + desc + '</option>';
                template = commands[r];
            } else {
                text += '<option value="' + r + '">' + desc + '</option>';
            }
        }
        text += '</select>';

        if (typeof desc === 'object') {
            desc = desc[systemLang] || desc.en;
        }

        if (!template) {
            text += '<td></td><td></td><td></td><td></td>';
        } else {
            // Words
            var words = template.words;
            if (words === undefined) {
                words = rule.words || '';
            } else if (typeof words === 'object') {
                words = desc[systemLang] || desc.en;
            }

            text += '<td><input class="edit-field" data-index="' + index + '" data-field="words" value="' + words + '" ' + (commands[r].editable ? '' : 'readonly') + '/></td>';

            // Arg1
            text += '<td>' + showArgument(index, 0, (commands[rule.template] && commands[rule.template].args && commands[rule.template].args[0]) ? commands[rule.template].args[0].type : '', rule.args ? rule.args[0] : null) + '</td>';

            // Arg2
            text += '<td>' + showArgument(index, 1, (commands[rule.template] && commands[rule.template].args && commands[rule.template].args[1]) ? commands[rule.template].args[1].type : '', rule.args ? rule.args[1] : null) + '</td>';

            // ack
            text += '<td><input class="edit-field" data-index="' + index + '" data-field="ack" type="checkbox" ></td>';
        }

        // buttons
        text += '<td>';
        if (index == 0) {
            text += '<span style="width: 20px"> </span>';
        } else {
            text += '<button class="rule-up" data-index="' + index + '" />';
        }
        if (that.rules.length - 1 == index) {
            text += '<span style="width: 20px"> </span>';
        } else {
            text += '<button class="rule-down" data-index="' + index + '" />';
        }
        text += '<button class="rule-delete" data-index="' + index + '" />';
        text += '</td>';
        return text;
    }

    function showRules() {
        var text = '';
        for (var r = 0; r < that.rules.length; r++) {
            text += showOneRule(r, that.rules[r]);
        }
        $('#tab-rules-body').html(text);

        // init buttons and fields
    }
    
    this.prepare = function () {

        installColResize();

        // Load settings
        that.currentFilter = that.main.config.rulesCurrentFilter || '';
        $('#rules-filter').val(that.currentFilter);

        $('#btn_refresh_text2command').button({icons: {primary: 'ui-icon-refresh'}, text: false}).css({width: 18, height: 18}).click(function () {
            that.init(true, true);
        });

        // add filter processing
        $('#rules-filter').keyup(function () {
            $(this).trigger('change');
        }).on('change', function () {
            if (that.filterTimer) {
                clearTimeout(that.filterTimer);
            }
            that.filterTimer = setTimeout(function () {
                that.filterTimer = null;
                that.currentFilter = $('#rules-filter').val();
                that.main.saveConfig('rulesCurrentFilter', that.currentFilter);
                that.applyFilter(that.currentFilter);
            }, 400);
        });

        $('#rules-filter-clear').button({icons: {primary: 'ui-icon-close'}, text: false}).css({width: 16, height: 16}).click(function () {
            $('#rules-filter').val('').trigger('change');
        });

        var $btnNewRule = $('#btn_new_rule');
        $btnNewRule.button({icons: {primary: 'ui-icon-plus'}, text: false}).css({width: 21, height: 21}).click(function () {
            that.addNewRule();
        });
        var background = $btnNewRule.css('background-color');
        $btnNewRule
            .css({
                'background-color': 'red'
            }, 'red')
            .animate({'background-color': background}, 500, function () {
                $btnNewRule.animate({'background-color': 'red'}, 500, function () {
                    $btnNewRule.animate({'background-color': background}, 3000);
                });
            });
        
        that.$dialogReplace.dialog({
            autoOpen: false,
            modal:    true,
            width:    510,
            height:   215,
            buttons: [
                {
                    text: _('Ok'),
                    click: function () {
                        $(this).dialog('close');
                        var oldId = $('#dialog-replace-old-id').val();
                        var newId = $('#dialog-replace-new-id').val();
                        if (oldId == newId) {
                            console.warn('IDs re equal');
                            return;
                        }

                        that.main.confirmMessage(_('Are you sure to replace \"%s\" with \"%s\" in all rule?', oldId, newId), _('Confirm'), 'help', function (isYes) {
                            if (isYes) {
                                replaceId(oldId, newId);
                            }
                        });
                    }
                },
                {
                    text: _('Cancel'),
                    click: function () {
                        $(this).dialog('close');
                    }
                }
            ]
        });

        $('#btn_replace_ids').button({icons: {primary: 'ui-icon ui-icon-transferthick-e-w'}, text: false}).css({width: 16, height: 16}).click(function () {
            that.$dialogReplace.dialog('open');
        });
        
        $('.dialog-rule-id-selector').click(function () {
            var id = $(this).data('input');
            var val = $('#' + id).val();
            var sid = that.main.initSelectId();
            sid.selectId('show', val, function (newId) {
                $('#' + id).val(newId || '');
            });
        });
    };


    function applyFilter(filter) {

    }

    this.resize = function (width, height) {
        $('#grid-rules-div').height($(window).height() - $('#tabs .ui-tabs-nav').height() - 50);
    };

    this.addNewRule = function () {
        this.rules.push({
            name: '',
            description: ''
        });
        showRules();
    };

    // ----------------------------- Scenes show and Edit ------------------------------------------------
    this.init = function (update) {
        if (!this.main.objectsLoaded) {
            setTimeout(function () {
                that.init();
            }, 250);
            return;
        }

        $('#tab-rules').show();
        
        showRules();
    };

    function replaceIdInRule(scene, oldId, newId) {
        var obj = that.main.objects[scene];
        if (!obj || !obj.native) return;
        var isChanged = false;

        // Check triggerId
        if (obj.native.onTrue && obj.native.onTrue.trigger && obj.native.onTrue.trigger.id == oldId) {
            obj.native.onTrue.trigger.id = newId;
            isChanged = true;
        }
        if (obj.native.onFalse && obj.native.onFalse.trigger && obj.native.onFalse.trigger.id == oldId) {
            obj.native.onFalse.trigger.id = newId;
            isChanged = true;
        }

        var members = obj.native.members;
        if (members && members.length) {
            for (var m = 0; m < members.length; m++) {
                if (members[m].id == oldId) {
                    members[m].id = newId;
                    isChanged = true;
                }
            }
        }

        if (isChanged) {
            that.main.socket.emit('setObject', scene, obj, function (err) {
                if (err) that.main.showError(err);
            });
        }
        return isChanged;
    }

    function replaceId(oldId, newId) {
        var rules = [];
        for (var i = 0; i < that.list.length; i++) {
            if (replaceIdInRule(that.list[i], oldId, newId)) {
                that.rules.push(that.list[i]);
            }
        }
        if (that.rules.length) {
            that.main.showMessage(_('IDs in following rules were replaced: %s', rule.join('<br>')), _('Result'));
        } else {
            that.main.showMessage(_('IDs was not found in any rule'), _('Result'));
        }
    }

    function storeConfig(scene, force) {
        if (that.timer) {
            clearTimeout(that.timer);
            that.timer = null;
        }

        that.timer = setTimeout(function () {
            that.main.socket.emit('getObject', scene, that.timers[scene].obj, function (err) {
                for (var c = 0; c < that.timers[scene].callbacks.length; c++) {
                    that.timers[scene].callbacks[c](err);
                }
                delete that.timers[scene];
            });
        }, !force ? 500 : 0);
    }

    this.initButtons = function (scene, m) {
        $('.scene-add-state[data-scene-name="' + scene + '"]').button({
            text: false,
            icons: {
                primary: 'ui-icon-plusthick'
            }
        }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
            var scene = $(this).attr('data-scene-name');
            var sid = that.main.initSelectIds();
            sid.selectId('show', null, function (newIds) {
                if (newIds && newIds.length) {
                    var obj = that.main.objects[scene];
                    for (var i = 0; i < newIds.length; i++) {
                        if (!obj.native.members) obj.native.members = [];

                        var desc = null;
                        if (that.main.states && that.main.states[newIds[i]] && that.main.states[newIds[i]].common) {
                            desc = that.main.states[newIds[i]].common.desc || null;
                        }

                        obj.native.members.push({
                            id:             newIds[i],
                            setIfTrue:      null,
                            setIfFalse:     null,
                            stopAllDelays:  true,
                            desc:           desc
                        });
                    }

                    that.main.socket.emit('setObject', scene, obj, function (err) {
                        if (err) that.main.showError(err);
                    });
                }
            });
        });

        $('.scene-copy-scene[data-scene-name="' + scene + '"]').button({
            text: false,
            icons: {
                primary: 'ui-icon-copy'
            }
        }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
            var scene = $(this).attr('data-scene-name');
            var i = 1;
            scene = scene.replace(/_\d+$/, '');
            while (that.list.indexOf(scene + '_' + i) != -1) i++;

            var obj = that.main.objects[scene];
            obj._id = scene + '_' + i;
            obj.common.name = obj.common.name.replace(/\s\d+$/, '') + ' ' + i;

            that.main.socket.emit('setObject', scene + '_' + i, obj, function (err) {
                if (err) that.main.showError(err);
            });
        });

        $('.scene-delete-submit[data-scene-name="' + scene + '"]').button({
            icons: {primary: 'ui-icon-trash'},
            text:  false
        }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
            var scene = $(this).attr('data-scene-name');

            that.main.confirmMessage(_('Are you sure to delete %s?', scene), _('Conform'), 'help', function (isYes) {
                if (isYes) {
                    that.main.socket.emit('delObject', scene, function (err) {
                        if (err) that.main.showError(err);
                    });
                }
            });
        });

        $('.scene-edit-submit[data-scene-name="' + scene + '"]').button({
            icons: {primary: 'ui-icon-note'},
            text: false
        }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
            var scene = $(this).attr('data-scene-name');
            editScene(scene);
        });

        if (m !== undefined) {
            $('.state-edit-enabled[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').change(function () {
                var scene = $(this).attr('data-scene-name');
                $(this).css({outline: '1px solid red'});
                var index = parseInt($(this).attr('data-state-index'), 10);

                var obj = {native: {members: []}};
                obj.native.members[index] = {};
                obj.native.members[index].disabled = !$(this).prop('checked');

                setObject(scene, obj, function (err) {
                    if (err) {
                        $(this).css({outline: ''}).prop('checked', !that.main.objects[scene].native.members[index].disabled);
                        that.main.showError(err);
                    }
                });
            });

            $('.state-edit-delay[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').change(function () {
                var timer = $(this).data('timer');
                var $self = $(this).css({outline: '1px solid red'});

                if (timer) clearTimeout(timer);

                $(this).data('timer', setTimeout(function () {
                    var scene = $self.attr('data-scene-name');
                    var index = parseInt($self.attr('data-state-index'), 10);
                    var delay = $self.val();

                    var obj = {native: {members: []}};
                    obj.native.members[index] = {};
                    delay = parseInt(delay, 10) || 0;
                    if (!delay) delay = '';

                    obj.native.members[index].delay = delay;

                    setObject(scene, obj, function (err) {
                        if (err) {
                            $(this).css({outline: ''}).val(that.main.objects[scene].native.members[index].delay);
                            that.main.showError(err);
                        }
                    });
                }, 500));
            }).keydown(function () {
                $(this).trigger('change');
            });

            $('.state-edit-setIfTrue[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').change(function () {
                var timer = $(this).data('timer');
                var $self = $(this).css({outline: '1px solid red'});
                if (timer) clearTimeout(timer);

                $(this).data('timer', setTimeout(function () {
                    var scene = $self.attr('data-scene-name');
                    var index = parseInt($self.attr('data-state-index'), 10);
                    var value;
                    if ($self.data('type') == 'checkbox') {
                        value = $self.prop('checked');
                    } else {
                        value = $self.val();
                        if (parseFloat(value).toString() == value) value = parseFloat(value);
                        if (value === 'true')  value = true;
                        if (value === 'false') value = false;
                    }

                    var obj = {native: {members: []}};
                    obj.native.members[index] = {};
                    obj.native.members[index].setIfTrue = value;
                    setObject(scene, obj, function (err) {
                        if (err) {
                            $(this).css({outline: ''}).val(that.main.objects[scene].native.members[index].setIfTrue);
                            that.main.showError(err);
                        }
                    });
                }, 500));
            }).keydown(function () {
                $(this).trigger('change');
            });

            $('.state-edit-setIfFalse[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').change(function () {
                var timer = $(this).data('timer');
                var $self = $(this).css({outline: '1px solid red'});
                if (timer) clearTimeout(timer);

                $(this).data('timer', setTimeout(function () {
                    var scene = $self.attr('data-scene-name');
                    var index = parseInt($self.attr('data-state-index'), 10);
                    var value;
                    if ($self.data('type') == 'checkbox') {
                        value = $self.prop('checked');
                    } else {
                        value = $self.val();
                        if (parseFloat(value).toString() == value) value = parseFloat(value);
                        if (value === 'true')  value = true;
                        if (value === 'false') value = false;
                    }

                    var obj = {native: {members: []}};
                    obj.native.members[index] = {};
                    obj.native.members[index].setIfFalse = value;
                    setObject(scene, obj, function (err) {
                        if (err) {
                            $(this).css({outline: ''}).val(that.main.objects[scene].native.members[index].setIfFalse);
                            that.main.showError(err);
                        }
                    });
                }, 500));
            }).keydown(function () {
                $(this).trigger('change');
            });

            $('.scene-state-edit-submit[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').button({
                icons: {primary: 'ui-icon-note'},
                text:  false
            }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
                var scene = $(this).attr('data-scene-name');
                var index = parseInt($(this).attr('data-state-index'), 10);

                editState(scene, index);
            });

            $('.scene-state-delete-submit[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').button({
                icons: {primary: 'ui-icon-trash'},
                text:  false
            }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
                var scene = $(this).attr('data-scene-name');
                var index = parseInt($(this).attr('data-state-index'), 10);
                var obj = that.main.objects[scene];

                that.main.confirmMessage(_('Are you sure to delete %s from %s?', obj.native.members[index].id, scene), _('Conform'), 'help', function (isYes) {
                    if (isYes) {
                        obj.native.members.splice(index, 1);

                        that.main.socket.emit('setObject', scene, obj, function (err) {
                            if (err) that.main.showError(err);
                        });
                    }
                });
            });
            $('.scene-state-up-submit[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').button({
                icons: {primary: 'ui-icon-circle-arrow-n'},
                text:  false
            }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
                var scene = $(this).attr('data-scene-name');
                var index = parseInt($(this).attr('data-state-index'), 10);
                var obj = that.main.objects[scene];
                var m = obj.native.members[index - 1];
                obj.native.members[index - 1] = obj.native.members[index];
                obj.native.members[index] = m;

                that.main.socket.emit('setObject', scene, obj, function (err) {
                    if (err) that.main.showError(err);
                });
            });
            $('.scene-state-down-submit[data-scene-name="' + scene + '"][data-state-index="' + m + '"]').button({
                icons: {primary: 'ui-icon-circle-arrow-s'},
                text:  false
            }).css('width', '22px').css('height', '18px').unbind('click').on('click', function () {
                var scene = $(this).attr('data-scene-name');
                var index = parseInt($(this).attr('data-state-index'), 10);
                var obj = that.main.objects[scene];
                var m = obj.native.members[index + 1];
                obj.native.members[index + 1] = obj.native.members[index];
                obj.native.members[index] = m;

                that.main.socket.emit('setObject', scene, obj, function (err) {
                    if (err) that.main.showError(err);
                });
            });
        } else {
            $('.scene-edit-enabled[data-scene-name="' + scene + '"]').change(function () {
                var scene = $(this).attr('data-scene-name');
                $(this).css({outline: '1px solid red'});
                var obj = {common: {}};
                obj.common.enabled = $(this).prop('checked');
                setObject(scene, obj, function (err) {
                    if (err) {
                        $(this).css({outline: ''}).prop('checked', that.main.objects[scene].common.enabled);
                        that.main.showError(err);
                    }
                });
            });
            $('.scene-edit-setIfFalse[data-scene-name="' + scene + '"]').change(function () {
                var scene = $(this).attr('data-scene-name');
                $(this).css({outline: '1px solid red'});
                var obj = {native: {onFalse:{}}};
                obj.native.onFalse.enabled = $(this).prop('checked');
                setObject(scene, obj, function (err) {
                    if (err) {
                        $(this).css({outline: ''}).prop('checked', that.main.objects[scene].native.onFalse && that.main.objects[scene].native.onFalse.enabled);
                        that.main.showError(err);
                    }
                });
            });
            $('.state-set-true[data-scene-name="' + scene + '"]').button({
                icons: {primary: 'ui-icon-play'},
                text: false
            }).css('width', '16px').css('height', '16px').click(function () {
                var scene = $(this).attr('data-scene-name');
                that.main.socket.emit('setState', scene, true, function (err) {
                    if (err) that.main.showError(err);
                });
            }).attr('title', _('Test scene with true'));

            $('.state-set-group[data-scene-name="' + scene + '"]').change(function () {
                var scene = $(this).attr('data-scene-name');
                var val = $(this).val();
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                if (parseFloat(val).toString() == val) val = parseFloat(val);

                that.main.socket.emit('setState', scene, val, function (err) {
                    if (err) that.main.showError(err);
                });
            }).attr('title', _('Test scene with true'));

            $('.state-set-false[data-scene-name="' + scene + '"]').button({
                icons: {primary: 'ui-icon-play'},
                text: false
            }).css('width', '16px').css('height', '16px').click(function () {
                var scene = $(this).attr('data-scene-name');
                that.main.socket.emit('setState', scene, false, function (err) {
                    if (err) that.main.showError(err);
                });
            }).attr('title', _('Test scene with false'));
        }
    };

    this.objectChange = function (id, obj) {
    };

    this.stateChange = function (id, state) {
    };
}

var main = {
    socket:         io.connect(),
    saveConfig:     function (attr, value) {
        if (!main.config) return;
        if (attr) main.config[attr] = value;

        if (typeof storage != 'undefined') {
            storage.set('adminConfig', JSON.stringify(main.config));
        }
    },
    showError:      function (error) {
        main.showMessage(_(error),  _('Error'), 'alert');
    },
    showMessage:    function (message, title, icon) {
        $dialogMessage.dialog('option', 'title', title || _('Message'));
        $('#dialog-message-text').html(message);
        if (icon) {
            $('#dialog-message-icon').show();
            $('#dialog-message-icon').attr('class', '');
            $('#dialog-message-icon').addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-message-icon').hide();
        }
        $dialogMessage.dialog('open');
    },
    confirmMessage: function (message, title, icon, callback) {
        $dialogConfirm.dialog('option', 'title', title || _('Message'));
        $('#dialog-confirm-text').html(message);
        if (icon) {
            $('#dialog-confirm-icon').show();
            $('#dialog-confirm-icon').attr('class', '');
            $('#dialog-confirm-icon').addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-confirm-icon').hide();
        }
        $dialogConfirm.data('callback', callback);
        $dialogConfirm.dialog('open');
    },
    initSelectIds:   function () {
        if (main.selectIds) return main.selectIds;
        main.selectIds = $('#dialog-select-members').selectId('init',  {
            objects:       main.objects,
            states:        main.states,
            noMultiselect: false,
            imgPath:       '../../lib/css/fancytree/',
            filter:        {type: 'state'},
            name:          'rules-add-states',
            texts: {
                select:          _('Select'),
                cancel:          _('Cancel'),
                all:             _('All'),
                id:              _('ID'),
                name:            _('Name'),
                role:            _('Role'),
                room:            _('Room'),
                value:           _('Value'),
                selectid:        _('Select ID'),
                from:            _('From'),
                lc:              _('Last changed'),
                ts:              _('Time stamp'),
                wait:            _('Processing...'),
                ack:             _('Acknowledged'),
                selectAll:       _('Select all'),
                unselectAll:     _('Deselect all'),
                invertSelection: _('Invert selection')
            },
            columns: ['image', 'name', 'role', 'room', 'value']
        });
        return main.selectIds;
    },
    initSelectId:   function () {
        if (main.selectId) return main.selectId;
        main.selectId = $('#dialog-select-member').selectId('init',  {
            objects:       main.objects,
            states:        main.states,
            noMultiselect: true,
            imgPath:       '../../lib/css/fancytree/',
            filter:        {type: 'state'},
            name:          'rules-select-state',
            texts: {
                select:          _('Select'),
                cancel:          _('Cancel'),
                all:             _('All'),
                id:              _('ID'),
                name:            _('Name'),
                role:            _('Role'),
                room:            _('Room'),
                value:           _('Value'),
                selectid:        _('Select ID'),
                from:            _('From'),
                lc:              _('Last changed'),
                ts:              _('Time stamp'),
                wait:            _('Processing...'),
                ack:             _('Acknowledged'),
                selectAll:       _('Select all'),
                unselectAll:     _('Deselect all'),
                invertSelection: _('Invert selection')
            },
            columns: ['image', 'name', 'role', 'room', 'value']
        });
        return main.selectId;
    },
    objects:        {},
    states:         {},
    currentHost:    '',
    objectsLoaded:  false,
    waitForRestart: false,
    selectId:       null,
    selectIds:      null
};

var $dialogMessage =        $('#dialog-message');
var $dialogConfirm =        $('#dialog-confirm');

// Read all positions, selected widgets for every view,
// Selected view, selected menu page,
// Selected widget or view page
// Selected filter
if (typeof storage != 'undefined') {
    try {
        main.config = storage.get('adminConfig');
        if (main.config) {
            main.config = JSON.parse(main.config);
        } else {
            main.config = {};
        }
    } catch (e) {
        console.log('Cannot load edit config');
        main.config = {};
    }
}

var firstConnect = true;
var text2command = new Text2Commands(main);

function getStates(callback) {
    main.socket.emit('getStates', function (err, res) {
        main.states = res;
        if (typeof callback === 'function') {
            setTimeout(function () {
                callback();
            }, 0);
        }
    });
}

function getObjects(callback) {
    main.socket.emit('getObjects', function (err, res) {
        setTimeout(function () {
            var obj;
            main.objects = res;
            for (var id in main.objects) {
                obj = res[id];
            }
            main.objectsLoaded = true;

            text2command.prepare();
            text2command.init();

            $(window).resize(function () {
                var x = $(window).width();
                var y = $(window).height();
                if (x < 720) {
                    x = 720;
                }
                if (y < 480) {
                    y = 480;
                }

                text2command.resize(x, y);
            });
            $(window).trigger('resize');

            if (typeof callback === 'function') callback();
        }, 0);
    });
}

function objectChange(id, obj) {
    var isNew    = false;

    // update main.objects cache
    if (obj) {
        if (obj._rev && main.objects[id]) main.objects[id]._rev = obj._rev;
        if (!main.objects[id]) {
            isNew = true;
        }
        if (isNew || JSON.stringify(main.objects[id]) != JSON.stringify(obj)) {
            main.objects[id] = obj;
        }
    } else if (main.objects[id]) {
        delete main.objects[id];
    }

    if (main.selectId)  main.selectId.selectId('object',  id, obj);
    if (main.selectIds) main.selectIds.selectId('object', id, obj);

    text2command.objectChange(id, obj);
}

function stateChange(id, state) {
    id = id ? id.replace(/ /g, '_') : '';

    if (!id || !id.match(/\.messagebox$/)) {
        if (main.selectId)  main.selectId.selectId('state', id, state);
        if (main.selectIds) main.selectIds.selectId('state', id, state);

        if (!state) {
            delete main.states[id];
        } else {
            main.states[id] = state;
        }

        text2command.stateChange(id, state);
    }
}

main.socket.on('permissionError', function (err) {
    main.showMessage(_('Has no permission to %s %s %s', err.operation, err.type, (err.id || '')));
});
main.socket.on('objectChange', function (id, obj) {
    setTimeout(objectChange, 0, id, obj);
});
main.socket.on('stateChange', function (id, obj) {
    setTimeout(stateChange, 0, id, obj);
});
main.socket.on('connect', function () {
    $('#connecting').hide();
    if (firstConnect) {
        firstConnect = false;

        main.socket.emit('getUserPermissions', function (err, acl) {
            main.acl = acl;
            // Read system configuration
            main.socket.emit('getObject', 'system.config', function (err, data) {
                main.systemConfig = data;
                if (!err && main.systemConfig && main.systemConfig.common) {
                    systemLang = main.systemConfig.common.language;
                } else {
                    systemLang = window.navigator.userLanguage || window.navigator.language;

                    if (systemLang !== 'en' && systemLang !== 'de' && systemLang !== 'ru') {
                        main.systemConfig.common.language = 'en';
                        systemLang = 'en';
                    }
                }

                translateAll();

                $dialogMessage.dialog({
                    autoOpen: false,
                    modal:    true,
                    buttons: [
                        {
                            text: _('Ok'),
                            click: function () {
                                $(this).dialog("close");
                            }
                        }
                    ]
                });

                $dialogConfirm.dialog({
                    autoOpen: false,
                    modal:    true,
                    buttons: [
                        {
                            text: _('Ok'),
                            click: function () {
                                var cb = $(this).data('callback');
                                $(this).dialog('close');
                                if (cb) cb(true);
                            }
                        },
                        {
                            text: _('Cancel'),
                            click: function () {
                                var cb = $(this).data('callback');
                                $(this).dialog('close');
                                if (cb) cb(false);
                            }
                        }

                    ]
                });

                getStates(getObjects);
            });
        });
    }
    if (main.waitForRestart) {
        location.reload();
    }
});
main.socket.on('disconnect', function () {
    $('#connecting').show();
});
main.socket.on('reconnect', function () {
    $('#connecting').hide();
    if (main.waitForRestart) {
        location.reload();
    }
});
main.socket.on('reauthenticate', function () {
    location.reload();
});