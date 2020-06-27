import React, { PureComponent } from 'react';
import SplitterLayout from 'react-splitter-layout';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import 'react-splitter-layout/lib/index.css';

import I18n from '@iobroker/adapter-react/i18n';

import LeftBar from './LeftBar';
import RightBar from './RightBar';
import Modal from './Modal';
import isEqual from 'lodash.isequal';

const styles = theme => ({
    mainLayout: {
        background: theme.palette.background.default,
    },
});

class Layout extends PureComponent {
    state = {
        currentRules: [],
        isOpen: false,
        isEdit: false,
        selectedRule: {},
        unsavedRules: {},
    };

    componentDidMount() {
        this.getDataFromConfig().then(({ rules, ...settings }) => {
            const rulesWithId = rules.map(rule =>
                !rule.id || !rule.name
                    ? {
                          ...rule,
                          id: !rule.id ? uuid() : rule.id,
                          name: !rule.name
                              ? window.commands[rule.template]?.name[I18n.getLanguage()]
                              : rule.name,
                      }
                    : rule
            );
            if (!isEqual(rules, rulesWithId)) {
                this.props.saveConfig({ rules: rulesWithId, ...settings });
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.settings?.language !== this.state.lang && this.state.settings?.language) {
            const lang = this.state.settings?.language;
            I18n.setLanguage(lang);

            this.commands = this.getSelectedLanguageCommands();
        }
        if (
            prevState.selectedRule?.id !== this.state.selectedRule?.id &&
            prevState.selectedRule?.id
        ) {
            console.log(prevState.selectedRule?.id, this.state.selectedRule?.id);
            localStorage.setItem('selectedRule', this.state.selectedRule.id);
        }
    }

    getSelectedLanguageCommands = () => {
        const lang = this.state.settings?.language || I18n.getLanguage();

        return [
            { rule: I18n.t('Select rule'), unique: false },
            ...Object.entries(window.commands).map(item => {
                const [key, command] = item;
                const { name, ...rest } = command;
                const obj = {
                    ...rest,
                    rule: command?.name[lang],
                    template: key,
                    unique: command.unique,
                    words: command.words && command.words[lang],
                    args: command.args?.map(arg => ({
                        ...arg,
                        name: arg.name[lang] || '',
                        default: arg.default || (arg.type === 'checkbox' ? false : ''),
                    })),
                    ack: command.ack && {
                        ...command.ack,
                        name: command.ack.name[lang],
                        default: !command.ack?.default
                            ? command.ack?.type === 'checkbox'
                                ? false
                                : ''
                            : command.ack.default[lang],
                    },
                };

                return obj;
            }),
        ];
    };

    commands = this.getSelectedLanguageCommands();

    moveRule = (dragIndex, hoverIndex) => {
        const { currentRules } = this.state;
        const sourceRule = currentRules.find((_, index) => index === hoverIndex);
        const sortRules = currentRules.filter((_, index) => index !== hoverIndex);
        sortRules.splice(dragIndex, 0, sourceRule);
        this.setState({ currentRules: sortRules });
    };

    handleOpen = () => {
        this.setState({
            isOpen: true,
        });
    };
    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleSubmitOnCreate = (selectedRule, isError) => {
        if (isError) return;

        const id = uuid();
        const shortDataRule = {
            ...selectedRule,
            id,
            _break: true,
        };

        const rule = {
            ...this.commands.find(command => command.rule === shortDataRule.rule),
            ...shortDataRule,
        };
        const isUnsavedChanges = Object.values(this.state.unsavedRules).length;

        this.setState(
            {
                currentRules: [...this.state.currentRules, rule],
                unsavedRules: {
                    ...this.state.unsavedRules,
                    [id]: {
                        id,
                        wasChangedGlobally: true,
                    },
                },
                selectedRule: !isUnsavedChanges ? rule : this.state.selectedRule,
            },
            () => {
                if (isUnsavedChanges) {
                    this.selectRule(rule.id);
                }
            }
        );

        this.handleClose();
    };

    handleSubmitOnEdit = (selectedRule, isError) => {
        if (isError) return;

        this.setState({
            unsavedRules: {
                ...this.state.unsavedRules,
                [selectedRule.id]: {
                    id: selectedRule.id,
                    wasChangedGlobally: true,
                },
            },
            currentRules: this.updateCurrentRules(selectedRule),
        });
        this.handleClose();
    };

    selectRule = id => {
        const { selectedRule, currentRules } = this.state;

        if (selectedRule.id === id) {
            // ignore
        } else if (this.state.unsavedRules[selectedRule.id]) {
            this.setState({
                pendingSelectedRuleId: id,
            });
        } else {
            const rule = currentRules.find(item => item.id === id);

            this.setState({
                selectedRule: rule,
            });
        }
    };

    updateCurrentRules = selectedRule => {
        return this.state.currentRules.map(item =>
            item.id === selectedRule.id ? selectedRule : item
        );
    };

    handleEdit = () => {
        this.setState({
            isEdit: true,
        });
        this.handleOpen();
    };

    finishEdit = editableRule => {
        let updatedRule;

        const { rule, id, name, _break, template } = editableRule;
        const initialSelectedRule = this.state.selectedRule;

        if (initialSelectedRule.rule !== rule) {
            const updatedRuleOptions = this.commands.find(command => command.rule === rule);
            updatedRule = {
                ...updatedRuleOptions,
                name,
                rule,
                id,
                _break,
                template,
            };
        } else {
            updatedRule = editableRule;
        }
        this.setState({
            isEdit: false,
            selectedRule: updatedRule,
        });
    };

    removeRule = id => {
        const deleteRuleFromConfig = async () => {
            const config = await this.props.readConfig();
            const { rules, ...settings } = config;
            const newConfig = { rules: rules.filter(rule => rule.id !== id), ...settings };
            this.props.saveConfig(newConfig);
        };
        this.setState(
            {
                currentRules: this.state.currentRules.filter(rule => rule.id !== id),
                selectedRule: {},
            },
            deleteRuleFromConfig
        );
    };

    updateConfig = async currentSelectedRule => {
        const { currentRules } = this.state;
        const { [currentSelectedRule.id]: removedId, ...ids } = this.state.unsavedRules;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const matchingRule = rules.find(rule => rule.id === currentSelectedRule.id);
        const updatedCurrentRules = matchingRule
            ? this.updateCurrentRules(currentSelectedRule)
            : currentRules;

        let updatedRules;
        if (matchingRule) {
            updatedRules = rules.map(rule =>
                rule.id === currentSelectedRule.id
                    ? this.getRuleShortData(currentSelectedRule)
                    : rule
            );
        } else {
            updatedRules = [...rules, this.getRuleShortData(currentSelectedRule)];
        }

        const newConfig = { rules: updatedRules, ...settings };
        await this.props.saveConfig(newConfig);

        this.setState({
            selectedRule: currentSelectedRule || this.state.selectedRule || {},
            currentRules: updatedCurrentRules,
            unsavedRules: ids,
        });
    };

    getDataFromConfig = async () => {
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;
        const lang = I18n.getLanguage();

        const rulesFullData = rules.map(rule => {
            const obj = window.commands[rule.template];

            return {
                ...obj,
                rule: obj?.name[lang],
                ack: {
                    ...obj.ack,
                    default: rule.ack || '',
                    name: obj.ack?.name[lang],
                },
                args: obj.args?.map((arg, index) => ({
                    ...arg,
                    default: rule.args[index] || '',
                    name: arg?.name[lang] || '',
                })),
                name: rule.name || obj?.name[lang],
                words: rule.words,
                _break: rule._break,
                id: rule.id || uuid(),
                template: rule.template,
            };
        });
        await this.setState({
            currentRules: rulesFullData,
            selectedRule: rulesFullData.find(
                rule => rule.id === localStorage.getItem('selectedRule')
            ),
            settings,
        });
        return config;
    };

    revertChangesFromConfig = async selectedRule => {
        const { currentRules } = this.state;
        const { [selectedRule.id]: removedId, ...ids } = this.state.unsavedRules;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const matchingRule = rules.find(rule => rule.id === selectedRule.id);
        let updatedRules;
        if (matchingRule) {
            updatedRules = currentRules.map(rule =>
                rule.id === matchingRule.id
                    ? {
                          ...rule,
                          ack: {
                              ...rule.ack,
                              default: matchingRule.ack || '',
                          },
                          args: rule.args?.map(arg => ({
                              ...arg,
                              default: matchingRule.arg || '',
                          })),
                          rule: window.commands[matchingRule.template].name[I18n.getLanguage()],
                          words: matchingRule.words || '',
                          name: matchingRule.name || '',
                          _break: matchingRule._break || true,
                      }
                    : rule
            );
        } else {
            updatedRules = currentRules.filter(rule => rule.id !== selectedRule.id);
        }
        await this.setState({
            currentRules: updatedRules,
            selectedRule: updatedRules.find(rule => rule.id === selectedRule.id) || {},
            settings,
            unsavedRules: ids,
        });

        if (this.state.currentRules.length !== currentRules.length) {
            this.setState({
                selectedRule: this.state.currentRules[this.state.currentRules.length - 1] || {},
            });
        }
    };

    saveSettings = async (localeSettings, closeModal) => {
        const config = await this.props.readConfig();
        const { rules } = config;
        this.setState({
            settings: localeSettings,
        });
        const newConfig = { rules, ...localeSettings };
        await this.props.saveConfig(newConfig);
        closeModal();
    };

    setUnsavedRule = id => {
        this.setState({
            unsavedRules: {
                ...this.state.unsavedRules,
                [id]: {
                    id,
                    wasChangedGlobally: false,
                },
            },
        });
    };

    removeUnsavedRule = id => {
        const { [id]: removedId, ...ids } = this.state.unsavedRules;
        this.setState({
            unsavedRules: ids,
        });
    };

    getRuleShortData = ({ _break, template, words, ack, args, name, id }) => ({
        words: words || '',
        ack: ack?.default || '',
        args: args?.map(arg => arg.default) || [],
        _break,
        template,
        name,
        id,
    });

    clearStateOnConfirmModalUnmount = id => {
        const { [id]: removedId, ...ids } = this.state.unsavedRules;

        this.setState({
            pendingSelectedRuleId: false,
            unsavedRules: ids,
        });
    };

    render() {
        console.log(this.state);
        const { isEdit, isOpen, currentRules, selectedRule } = this.state;
        return [
            <SplitterLayout
                key="splitterLayout"
                customClassName={this.props.classes.mainLayout}
                percentage
                // primaryMinSize={15}
                secondaryInitialSize={75}
                secondaryMinSize={65}>
                <LeftBar
                    handleOpen={this.handleOpen}
                    rules={currentRules}
                    moveRule={this.moveRule}
                    handleEdit={this.handleEdit}
                    selectRule={this.selectRule}
                    selectedRule={selectedRule}
                    removeRule={this.removeRule}
                    settings={this.state.settings}
                    socket={this.props.socket}
                    saveSettings={this.saveSettings}
                    theme={this.props.theme}
                    unsavedRules={this.state.unsavedRules}
                />
                {this.state.settings && (
                    <RightBar
                        selectedRule={selectedRule}
                        socket={this.props.socket}
                        updateCurrentRules={this.updateCurrentRules}
                        updateConfig={this.updateConfig}
                        revertChangesFromConfig={this.revertChangesFromConfig}
                        pendingSelectedRuleId={this.state.pendingSelectedRuleId}
                        unsavedRules={this.state.unsavedRules}
                        selectRule={this.selectRule}
                        clearStateOnConfirmModalUnmount={this.clearStateOnConfirmModalUnmount}
                        lang={this.state.settings.language}
                        setUnsavedRule={this.setUnsavedRule}
                        removeUnsavedRule={this.removeUnsavedRule}
                    />
                )}
            </SplitterLayout>,
            this.state.isOpen && (
                <Modal
                    key="modal"
                    commands={this.commands}
                    isEdit={isEdit}
                    handleSubmitOnCreate={this.handleSubmitOnCreate}
                    handleSubmitOnEdit={this.handleSubmitOnEdit}
                    handleClose={this.handleClose}
                    isOpen={isOpen}
                    currentRules={currentRules}
                    selectedRule={selectedRule}
                    finishEdit={this.finishEdit}
                />
            ),
        ];
    }
}

Layout.propTypes = {
    socket: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    readConfig: PropTypes.func.isRequired,
    saveConfig: PropTypes.func.isRequired,
};

export default withStyles(styles)(Layout);
