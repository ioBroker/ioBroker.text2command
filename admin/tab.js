/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

function Text2Commands(main, instance) {
    var that            = this;
    this.list           = [];
    this.main           = main;
    this.currentFilter  = '';
    this.$dialogReplace = $('#dialog-replace');
    this.timer          = null;
    this.rules          = [];

    instance            = instance || 0;

    function installColResize() {
        if (!$.fn.colResizable) return;

        var $grid = $('#grid-rules');
        if ($grid.is(':visible')) {
            $grid.colResizable({
                liveDrag: true
            });
        } else {
            setTimeout(function () {
                installColResize();
            }, 400)
        }
    }

    function showArgument(index, argIndex, arg, value, rule) {

        value = (value === undefined || value === null ? '' : value);
        // set default value
        if (arg.default && !value && value !== 0) {
            rule.args = rule.args || [];
            if (typeof arg.default === 'object') {
                value = arg.default[systemLang] || arg.default.en;
            } else {
                value = arg.default;
            }
            rule.args[argIndex] = value;
        }

        var text = (arg && arg.type) ? '<input class="edit-field-args" ' + (arg.type === 'checkbox' ? 'type="checkbox" data-type="value"': 'style="width: 100%" data-type="' + arg.type + '"') + ' data-index="' + index + '" data-field="args" data-args-index="' + argIndex + '" />' : '';

        if (typeof arg.name === 'object') {
            text = '<span style="font-size: x-small">' + (arg.name[systemLang] || arg.name.en) + '</span><br>' + text;
        } else if (arg.name) {
            text = '<span style="font-size: x-small">' + arg.name + '<br></span>' + text;
        }

        switch (arg.type) {
            case 'value':
            case 'checkbox':
                break;
            
            case 'id':
                text = text.replace('100%', 'calc(100% - 25px)');
                text += '<button data-role="' + (arg.role || '') + '" data-index="' + index + '" data-args-index="' + argIndex + '" class="select-id" title="' + _('select id') + '"></button>';
                text += '<br><span style="font-size: x-small" data-index="' + index + '" data-args-index="' + argIndex + '" class="id-name">' + ((value && that.main.objects[value] &&  that.main.objects[value].common) ? that.main.objects[value].common.name : '') + '</span>';
                break;
            
            default:
                break;
        }
        return text;
    }
    
    function showOneRule(index, rule) {
        var template = null;

        var text = '<tr class="line-rule ' + ((index & 1) ? 'tr-odd' : 'tr-even') + '" data-index="' + index + '">';
        // type
        text += '<td><select class="select-field" data-index="' + index + '" data-field="template">' +
            '<option value="">' + _('Select template') + '</option>';

        for (var r in commands) {
            if (!commands.hasOwnProperty(r)) continue;

            if (commands[r].unique) {
                var found = false;
                // check if such a template exists
                for (var i = 0; i < index; i++) {
                    if (that.rules[i].template === r) {
                        found = true;
                        break;
                    }
                }
                if (found && rule.template !== r) continue;
            }
            var name = commands[r].name;
            if (typeof name === 'object') {
                name = name[systemLang] || name.en;
            }

            if (rule.template === r) {
                text += '<option selected value="' + r + '">' + name + '</option>';
                template = commands[r];
            } else {
                text += '<option value="' + r + '">' + name + '</option>';
            }
        }

        text += '</select>';

        if (!template) {
            text += '<td></td><td></td><td></td><td></td><td></td>';
        } else {
            if (rule.words === undefined) {
                rule.words = template.words ? (template.words[systemLang] || template.words.en) : '';
                saveSettings();
            }

            // Words
            var words = rule.words;
            if (!words) words = template.words || '';

            if (typeof words === 'object') {
                words = words[systemLang] || words.en;
            }

            text += '<td><input style="width: 100%" class="edit-field" data-index="' + index + '" data-field="words" value="' + words + '" ' + ' ' + (commands[rule.template].editable === false ? 'readonly' : '') + '/></td>';

            // break
            text += '<td style="text-align: center"><input class="edit-field" data-index="' + index + '" data-field="_break" type="checkbox" ' + (rule._break ? 'checked' : '') + '/></td>';

            // Arg1
            text += '<td>' + showArgument(index, 0, (commands[rule.template] && commands[rule.template].args && commands[rule.template].args[0]) ? commands[rule.template].args[0] : '', rule.args ? rule.args[0] : null, rule) + '</td>';

            // Arg2
            text += '<td>' + showArgument(index, 1, (commands[rule.template] && commands[rule.template].args && commands[rule.template].args[1]) ? commands[rule.template].args[1] : '', rule.args ? rule.args[1] : null, rule) + '</td>';

            // ack
            if (template.ack) {
                text += '<td style="' + ((template.ack.type === 'checkbox') ? 'text-align: center' : '') + '">';
                text += '<span style="font-size: x-small">' + (template.ack.name[systemLang] || template.ack.name.en) + '</span><br>';

                if (template.ack.type === 'checkbox') {
                    if (rule.ack === undefined || rule.ack === null) rule.ack = template.ack.default || false;
                    text += '<input class="edit-field" data-index="' + index + '" data-field="ack" type="checkbox" ' + (rule.ack ? 'checked' : '') + '/></td>';
                } else {
                    if (rule.ack === undefined || rule.ack === null) {
                        if (typeof template.ack.default === 'object') {
                            rule.ack = template.ack.default[systemLang] || template.ack.default.en;
                        } else {
                            rule.ack = template.ack.default || '';
                        }
                    }
                    text += '<input class="edit-field" data-index="' + index + '" data-field="ack" value="' + rule.ack + '" style="width: calc(100% - 27px); margin-right: 2px"/><button class="rule-select-id" data-index="' + index + '" /></td>';
                }
            } else {
                text += '<td></td>';
            }
        }

        // buttons
        text += '';
        if (!index) {
            text += '<td></td>';
        } else {
            text += '<td style="text-align: center"><button class="rule-up" data-index="' + index + '" /></td>';
        }
        if (that.rules.length - 1 === index) {
            text += '<td></td>';
        } else {
            text += '<td style="text-align: center"><button class="rule-down" data-index="' + index + '" /></td>';
        }
        text += '<td style="text-align: center"><button class="rule-delete" data-index="' + index + '" /></td>';
        return text;
    }

    function showRules() {
        var text = '';
        for (var r = 0; r < that.rules.length; r++) {
            if (that.currentFilter) {
                var reg = new RegExp(that.currentFilter.replace(/\//g, '\/').replace(/\\/g, '\\').replace(/\./g, '\.'), 'i');
                var template = that.rules[r].template;
                if (!template) continue;
                template = commands[template];

                var found = false;
                var name = template.name;
                if (typeof name === 'object') {
                    name = name[systemLang] || name.en;
                }
                if (!found && that.rules[r].words                   && reg.test(that.rules[r].words))         found = true;
                if (!found && typeof that.rules[r].ack === 'object' && reg.test(that.rules[r].ack))           found = true;
                if (!found && name                                  && reg.test(name))                        found = true;
                if (!found && that.rules[r].args && that.rules[r].args[0] && reg.test(that.rules[r].args[0])) found = true;
                if (!found && that.rules[r].args && that.rules[r].args[1] && reg.test(that.rules[r].args[1])) found = true;
                if (!found) continue;
            }
            text += showOneRule(r, that.rules[r]);
        }
        $('#tab-rules-body').html(text);

        var $editArgs = $('.edit-field-args');
        // Write arguments into it
        $editArgs.each(function () {
            var $this = $(this);
            var index    = $this.data('index');
            var argIndex = $this.data('args-index');
            var field    = $this.data('field');

            that.rules[index].args = that.rules[index].args || [];
            if ($this.attr('type') === 'checkbox') {
                $this.prop('checked', that.rules[index].args[argIndex]);
            } else {
                $this.val(that.rules[index].args[argIndex]);
            }
            /*if ($this.data('type') === 'id') {
                var id = that.rules[index].args[argIndex];
                $('.id-name[data-index=' + index + '][data-args-index=' + argIndex +  ']').html(
                    (that.main.objects[id] && that.main.objects[id].common) ? that.main.objects[id].common.name || '' : ''
                );
            }*/
        });

        // init buttons and fields
        // init template selector
        $('.select-field').each(function () {
            $(this).on('change', function () {
                var index = $(this).data('index');
                that.rules[index].template = $(this).val();

                if (!commands[that.rules[index].template].editable) {
                    that.rules[index].words = undefined;
                }
                showRules();
                saveSettings();
            });
        });

        $('.edit-field').each(function () {
            if ($(this).prop('readonly')) {
                $(this).css('color', 'darkgray');
            }

            $(this).on('change', function () {
                var index = $(this).data('index');
                var field = $(this).data('field');
                if ($(this).attr('type') === 'checkbox') {
                    that.rules[index][field] = $(this).prop('checked');
                } else {
                    that.rules[index][field] = $(this).val();
                }
                saveSettings();
            });
        });

        $('.rule-up').button({icons: {primary: 'ui-icon-arrowthick-1-n'}, text: false}).css({width: 21, height: 21}).click(function () {
            var index = $(this).data('index');
            var rule = that.rules[index - 1];
            that.rules[index - 1] = that.rules[index];
            that.rules[index] = rule;
            setTimeout(function () {
                saveSettings();
                showRules();
            }, 100);
        });

        $('.rule-down').button({icons: {primary: 'ui-icon-arrowthick-1-s'}, text: false}).css({width: 21, height: 21}).click(function () {
            var index = $(this).data('index');
            var rule = that.rules[index + 1];
            that.rules[index + 1] = that.rules[index];
            that.rules[index] = rule;
            setTimeout(function () {
                saveSettings();
                showRules();
            }, 100);
        });

        $('.rule-delete').button({icons: {primary: 'ui-icon-trash'}, text: false}).css({width: 21, height: 21}).click(function () {
            var index = $(this).data('index');
            that.main.confirmMessage(_('Are you sure?'), _('Confirm deletion'), 'trash', function (result) {
                if (result) {
                    that.rules.splice(index, 1);
                    saveSettings();
                    showRules();
                }
            });
        });

        $('.rule-select-id').button({icons: {primary: 'ui-icon-pencil'}, text: false}).css({width: 21, height: 21}).click(function () {
            var $dlg = $('#dialog-ack-editor');
            var index = $(this).data('index');
            var text = $('.edit-field[data-field="ack"][data-index="' + index + '"]').val();
            $dlg.find('.dialog-ack-editor-textarea')
                .val(text)
                .data('index', index);
            $dlg.dialog('open');
        });

        $editArgs.on('change', function () {
            var $this = $(this);
            if ($this.data('timer')) clearTimeout($this.data('timer'));
            $this.data('timer', setTimeout(function () {
                $this.data('timer', null);
                var index    = $this.data('index');
                var argIndex = $this.data('args-index');
                var field    = $this.data('field');

                that.rules[index].args = that.rules[index].args || [];
                if ($this.attr('type') === 'checkbox') {
                    that.rules[index].args[argIndex] = $this.prop('checked');
                } else {
                    that.rules[index].args[argIndex] = $this.val();
                }
                if ($this.data('type') === 'id') {
                    var id = that.rules[index].args[argIndex];
                    $('.id-name[data-index=' + index + '][data-args-index=' + argIndex +  ']').html(
                        (that.main.objects[id] && that.main.objects[id].common) ? that.main.objects[id].common.name || '' : ''
                    );
                }

                saveSettings();
            }, 100));

        }).keydown(function () {
            $(this).trigger('change');
        });

        $('.select-id').button({icons: {primary: 'ui-icon-folder-open'}, text: false}).css({width: 21, height: 21}).click(function () {
            var index = $(this).data('index');
            var argIndex = $(this).data('args-index');
            var sid = that.main.initSelectId();
            var role = $(this).data('role');
            if (role) {
                sid.selectId('option', 'filterPresets',  {role: role});
            } else {
                sid.selectId('option', 'filterPresets',  {role: ''});
            }
            sid.selectId('show', that.rules[index].args ? (that.rules[index].args[argIndex] || '') : '', function (newId) {
                $('.edit-field-args[data-index=' + index + '][data-args-index=' + argIndex + ']').val(newId || '').trigger('change');
            });
        });
    }

    function saveSettings(force) {
        $('#btn_save_settings').button('enable');

        if (that.saveTimer) {
            clearTimeout(that.saveTimer);
            that.saveTimer = null;
        }

        that.saveTimer = setTimeout(function () {
            that.saveTimer   = null;
            that.saveRunning = true;

            // show
            test();

            that.main.socket.emit('getObject', 'system.adapter.text2command.' + instance, function (err, obj) {
                if (err) {
                    that.main.showError(err);
                } else if (obj) {
                    obj.native.rules            = that.rules;
                    obj.native.sayitInstance    = $('#rules-sayitInstance').val();
                    obj.native.language         = $('#rules-language').val();
                    obj.native.processorId      = $('#rules-processor').val();
                    obj.native.processorTimeout = parseInt($('#rules-processor-timeout').val(), 10) || 1000;

                    that.main.socket.emit('setObject', obj._id, obj, function (err) {
                        if (err) {
                            that.main.showError(err);
                        } else {
                            $('#btn_save_settings').button('disable');
                        }
                        that.saveRunning = false;
                    });
                }
            });

        }, force ? 0 : 500);
    }

    this.prepare = function () {

        installColResize();

        // Load settings
        that.currentFilter = that.main.config.rulesCurrentFilter || '';

        $('#btn_refresh_text2command').button({icons: {primary: 'ui-icon-refresh'}, text: false}).css({width: 18, height: 18}).click(function () {
            that.init(true, true);
        });

        // add filter processing
        $('#rules-filter')
            .val(that.currentFilter)
            .keyup(function () {
                $(this).trigger('change');
            }).on('change', function () {
                if (that.filterTimer) {
                    clearTimeout(that.filterTimer);
                }
                that.filterTimer = setTimeout(function () {
                    that.filterTimer = null;
                    that.currentFilter = $('#rules-filter').val();
                    that.main.saveConfig('rulesCurrentFilter', that.currentFilter);
                    showRules();
                }, 400);
            });

        $('#rules-filter-clear').button({icons: {primary: 'ui-icon-close'}, text: false}).css({width: 16, height: 16}).click(function () {
            $('#rules-filter').val('').trigger('change');
        });

        $('#rules-test-clear').button({icons: {primary: 'ui-icon-close'}, text: false}).css({width: 16, height: 16}).click(function () {
            $('#rules-test').val('').trigger('change');
        });

        var $btnNewRule = $('#btn_new_rule');
        $btnNewRule.button({icons: {primary: 'ui-icon-plus'}, text: false}).css({width: 21, height: 21}).click(function () {
            that.addNewRule();
        });
        // show blink on start
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
            height:   255,
            buttons: [
                {
                    text: _('Ok'),
                    click: function () {
                        $(this).dialog('close');
                        var oldId = $('#dialog-replace-old-id').val();
                        var newId = $('#dialog-replace-new-id').val();
                        if (oldId === newId) {
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

        $('#dialog-settings').dialog({
            autoOpen: false,
            modal:    true,
            width:    510,
            height:   255,
            buttons: [
                {
                    text: _('Ok'),
                    click: function () {
                        $(this).dialog('close');
                        saveSettings(true);
                    }
                },
                {
                    text: _('Cancel'),
                    click: function () {
                        // restore settings
                        var native = that.main.objects['system.adapter.text2command.' + instance].native;
                        $('#rules-sayitInstance').val(native.sayitInstance);
                        $('#rules-language').val(native.language);
                        $('#rules-processor').val(native.processorId || '');
                        $('#rules-timeout').val(native.processorTimeout || 1000);
                        $(this).dialog('close');
                    }
                }
            ]
        });
        $('#dialog-ack-editor').dialog({
            autoOpen: false,
            modal:    true,
            width:    510,
            height:   255,
            buttons: [
                {
                    text: _('Ok'),
                    click: function () {
                        $(this).dialog('close');
                        var index = $(this).find('.dialog-ack-editor-textarea').data('index');
                        var text = $(this).find('.dialog-ack-editor-textarea').val();
                        $('.edit-field[data-field="ack"][data-index="' + index + '"]').val(text).trigger('change');
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
        $('#btn_replace_ids').button({icons: {primary: 'ui-icon-transferthick-e-w'}, text: false}).css({width: 16, height: 16}).click(function () {
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

        $('.dialog-ack-editor-selectid').button({icons: {primary: 'ui-icon-folder-open'}, text: false}).css({width: 21, height: 21, position: 'absolute', top: 6, right: 6}).click(function () {
            var $textarea = $('.dialog-ack-editor-textarea');
            var cursorPosition = $textarea.prop('selectionStart');
            var sid = that.main.initSelectId();
            sid.selectId('show', '', function (newId) {
                if (newId) {
                    var text = $textarea.val();
                    text = text.substring(0, cursorPosition) + '{' + newId + '}' + text.substring(cursorPosition);
                    cursorPosition += newId.length + 2;
                    $textarea.val(text);
                    setTimeout(function () {
                        $textarea.focus().prop('selectionStart', cursorPosition).prop('selectionEnd', cursorPosition);
                    }, 200);
                }
            });
        });


        $('#btn_save_settings').button({icons: {primary: 'ui-icon-disk'}, text: false}).css({width: 21, height: 21}).click(function() {
            saveSettings(true);
        }).button('disable');

        $('#rules-test').attr('placeholder', _('enter test phrase')).on('change', function () {
            test();
        }).keydown(function () {
            $(this).trigger('change');
        });

        $('.rules-select-sayitInstance').button({icons: {primary: 'ui-icon-folder-open'}, text: false}).css({width: 21, height: 21}).click(function () {
            var sid = that.main.initSelectId();
            sid.selectId('option', 'filterPresets',  {role: ''});
            var id = $(this).data('input');

            sid.selectId('show', $('#' + id).val() || '', function (newId) {
                $('#' + id).val(newId).trigger('change');
            });
        });
        /*$('#rules-sayitInstance').on('change', function () {
            saveSettings();
        });
        $('#rules-sayitInstance').on('change', function () {
            saveSettings();
        });
        */
        $('#rules-open-settings').button({icons: {primary: 'ui-icon-gear'}, text: false}).css({width: 21, height: 21}).click(function () {
            var native = that.main.objects['system.adapter.text2command.' + instance].native;
            $('#rules-language').val(native.language);
            $('#rules-sayitInstance').val(native.sayitInstance);
            $('#rules-processor').val(native.processorId || '');
            $('#rules-processor-timeout').val(native.processorTimeout || 1000);

            $('#dialog-settings').dialog('open');
        });

        $('#rules-test-real').button({icons: {primary: 'ui-icon-play'}, text: false}).css({width: 21, height: 21}).click(function () {
            that.main.socket.emit('setState', 'text2command.' + instance + '.text', $('#rules-test').val(), function (err) {
                if (err) console.error(err);
            });
        });
    };

    var testTimer;
    function test() {
        if (testTimer) {
            clearTimeout(testTimer);
        }
        testTimer = setTimeout(function () {
            testTimer = null;
            var txt = $('#rules-test').val();
            var matched = txt ? findMatched(txt, JSON.parse(JSON.stringify(that.rules))) : [];
            for (var r = 0; r < that.rules.length; r++) {
                if (matched.indexOf(r) !== -1) {
                    $('.line-rule[data-index=' + r + ']').css('background-color', 'lightblue');
                } else {
                    $('.line-rule[data-index=' + r + ']').css('background-color', '');
                }
            }
        }, 500);
    }

    this.resize = function (width, height) {
        $('#grid-rules-div').height($(window).height() - $('#tabs .ui-tabs-nav').height() - 50);
    };

    this.addNewRule = function () {
        this.rules.push({
            template: '',
            _break: true
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
        if (update) {
            that.main.socket.emit('getObject', 'system.adapter.text2command.' + instance, function (err, obj) {
                if (err) {
                    that.main.showError(err);
                }
                if (obj) {
                    that.main.objects['system.adapter.text2command.' + instance] = obj;
                    if (obj.native) {
                        that.rules = obj.native.rules || [];
                    } else {
                        that.rules = [];
                    }
                    showRules();
                }
            });
        } else {
            if (this.main.objects['system.adapter.text2command.' + instance] && this.main.objects['system.adapter.text2command.' + instance].native) {
                this.rules = this.main.objects['system.adapter.text2command.' + instance].native.rules || [];
            } else {
                this.rules = [];
            }
            showRules();
        }
    };

    function replaceIdInRule(scene, oldId, newId) {
        var obj = that.main.objects[scene];
        if (!obj || !obj.native) return;
        var isChanged = false;

        // Check triggerId
        if (obj.native.onTrue && obj.native.onTrue.trigger && obj.native.onTrue.trigger.id === oldId) {
            obj.native.onTrue.trigger.id = newId;
            isChanged = true;
        }
        if (obj.native.onFalse && obj.native.onFalse.trigger && obj.native.onFalse.trigger.id === oldId) {
            obj.native.onFalse.trigger.id = newId;
            isChanged = true;
        }

        var members = obj.native.members;
        if (members && members.length) {
            for (var m = 0; m < members.length; m++) {
                if (members[m].id === oldId) {
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

    this.objectChange = function (id, obj) {
    };

    this.stateChange = function (id, state) {
        if (id === 'text2command.' + instance + '.response') {
            var pos = $('#rules-test').position();
            if (state.val && state.val.match(/^Error\.|^Fehler\.|^Ошибка\./)) {
                that.main.socket.emit('getState', 'text2command.' + instance + '.error', function (err, eState) {
                    $('#response')
                        .html(eState && eState.val ? eState.val : (state.val || ''))
                        .stop()
                        .show()
                        .css({top: pos.top + 30, left: pos.left + 5, opacity: 1})
                        .animate({'opacity': 0}, 5000);
                });
            } else {
                $('#response')
                    .html(state.val || '')
                    .stop()
                    .show()
                    .css({top: pos.top + 30, left: pos.left + 5, opacity: 1})
                    .animate({'opacity': 0}, 5000);
            }
        }
    };
}

var main = {
    socket:         io.connect(),
    saveConfig:     function (attr, value) {
        if (!main.config) return;
        if (attr) main.config[attr] = value;

        if (typeof storage !== 'undefined') {
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
            $('#dialog-message-icon')
                .show()
                .attr('class', '')
                .addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-message-icon').hide();
        }
        $dialogMessage.dialog('open');
    },
    confirmMessage: function (message, title, icon, callback) {
        $dialogConfirm.dialog('option', 'title', title || _('Message'));
        $('#dialog-confirm-text').html(message);
        if (icon) {
            $('#dialog-confirm-icon')
                .show()
                .attr('class', '')
                .addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-confirm-icon').hide();
        }
        $dialogConfirm.data('callback', callback);
        $dialogConfirm.dialog('open');
    },
/*    initSelectIds:   function () {
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
    },*/
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
if (typeof storage !== 'undefined') {
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

var attributes = decodeURIComponent(window.location.search.substring(1)).split('&');
var instance = 0;
for (var i = 0; i < attributes.length; i++) {
    var sParams = attributes[i].split('=');

    if (sParams[0] === 'instance') instance = sParams[1];
}

var firstConnect = true;
var text2command = new Text2Commands(main, instance);

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
        if (isNew || JSON.stringify(main.objects[id]) !== JSON.stringify(obj)) {
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
                main.socket.emit('subscribeObjects', '*');
                main.socket.emit('subscribe', 'text2command.' + instance + '.*');
            });
        });
    } else {
        main.socket.emit('subscribeObjects', '*');
        main.socket.emit('subscribe', 'text2command.' + instance + '.*');
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