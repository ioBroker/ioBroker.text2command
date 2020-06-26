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
    };

    componentDidMount() {
        this.getDataFromConfig().then(() => {});
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.settings?.language !== this.state.lang && this.state.settings?.language) {
            const lang = this.state.settings?.language;
            I18n.setLanguage(lang);

            this.commands = this.getSelectedLanguageCommands();
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

        this.setState(
            {
                currentRules: [...this.state.currentRules, rule],
                ruleWasUpdatedId: id,
                selectedRule: !this.state.pendingChanges ? rule : this.state.selectedRule,
            },
            () => {
                if (this.state.pendingChanges) {
                    this.selectRule(rule.id);
                }
            }
        );

        this.handleClose();
    };

    handleSubmitOnEdit = (selectedRule, isError) => {
        if (isError) return;

        this.setState({
            ruleWasUpdatedId: selectedRule.id,
            currentRules: this.updateCurrentRules(selectedRule),
        });
        this.handleClose();
    };

    selectRule = id => {
        const { selectedRule, currentRules } = this.state;

        if (selectedRule.id === id) {
            // ignore
        } else if (this.state.pendingChanges) {
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

    updatePendingState = (bool, id) => {
        if (this.state.pendingChanges === bool) {
            return;
        }

        this.setState({
            pendingChanges: bool,
            ruleWasUpdatedId:
                id === this.state.ruleWasUpdatedId ? false : this.state.ruleWasUpdatedId,
        });
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

        const { rule, id, name, _break } = editableRule;
        const initialSelectedRule = this.state.selectedRule;

        if (initialSelectedRule.rule !== rule) {
            const updatedRuleOptions = this.commands.find(command => command.rule === rule);
            updatedRule = {
                ...updatedRuleOptions,
                name,
                rule,
                id,
                _break,
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
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const isRuleAlreadyExist = currentRules.length === rules.length;

        let updatedRules;
        if (isRuleAlreadyExist) {
            updatedRules = currentRules.map(rule => this.getRuleShortData(rule));
        } else {
            updatedRules = [...rules, this.getRuleShortData(currentSelectedRule)];
        }

        const newConfig = { rules: updatedRules, ...settings };
        await this.props.saveConfig(newConfig);

        this.setState({
            selectedRule: currentSelectedRule || this.state.selectedRule || {},
            currentRules: isRuleAlreadyExist
                ? this.updateCurrentRules(currentSelectedRule)
                : currentRules,
            pendingChanges: false,
            ruleWasUpdatedId:
                currentSelectedRule.id === this.state.ruleWasUpdatedId
                    ? false
                    : this.state.ruleWasUpdatedId,
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
                rule: obj.name[lang],
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
                name: rule.name,
                words: rule.words,
                _break: rule._break,
                id: uuid(),
            };
        });
        console.log(rulesFullData);
        await this.setState({
            currentRules: rulesFullData,
            settings,
        });
    };

    revertChangesFromConfig = async selectedRule => {
        const { currentRules } = this.state;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const matchingRule = rules.find(rule => rule.id === selectedRule.id);
        let updatedRules;
        if (matchingRule) {
            updatedRules = this.state.currentRules.map(rule =>
                rule.id === matchingRule.id ? matchingRule : rule
            );
        } else {
            updatedRules = currentRules.filter(rule => rule.id !== selectedRule.id);
        }

        await this.setState({
            currentRules: updatedRules,
            selectedRule: matchingRule || {},
            settings,
            ruleWasUpdatedId: this.getRuleWasUpdatedId(selectedRule.id),
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

    getRuleWasUpdatedId = id => {
        return id === this.state.ruleWasUpdatedId ? false : this.state.ruleWasUpdatedId;
    };

    getRuleShortData = ({ _break, template, words, ack, args, name }) => ({
        words: words || '',
        ack: ack?.default || '',
        args: args?.map(arg => arg.default) || [],
        _break,
        template,
        name,
    });

    clearStateOnConfirmModalUnmount = () => {
        this.setState({
            pendingChanges: false,
            pendingSelectedRuleId: false,
        });
    };

    render() {
        console.log(this.commands);
        console.log(this.state);
        const { isEdit, isOpen, currentRules, selectedRule, ruleWasUpdatedId } = this.state;
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
                />
                {this.state.settings && (
                    <RightBar
                        selectedRule={selectedRule}
                        socket={this.props.socket}
                        updateCurrentRules={this.updateCurrentRules}
                        updateConfig={this.updateConfig}
                        revertChangesFromConfig={this.revertChangesFromConfig}
                        pendingSelectedRuleId={this.state.pendingSelectedRuleId}
                        selectRule={this.selectRule}
                        updatePendingState={this.updatePendingState}
                        clearStateOnConfirmModalUnmount={this.clearStateOnConfirmModalUnmount}
                        pendingChanges={this.state.pendingChanges}
                        ruleWasUpdatedId={ruleWasUpdatedId}
                        lang={this.state.settings.language}
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
