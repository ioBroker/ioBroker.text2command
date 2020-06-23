import React, { PureComponent } from 'react';
import SplitterLayout from 'react-splitter-layout';
import { v4 as uuid } from 'uuid';
import I18n from '@iobroker/adapter-react/i18n';
import 'react-splitter-layout/lib/index.css';
import LeftBar from './LeftBar';
import RightBar from './RightBar';
import { commands } from '@admin/langModel';
import Modal from './Modal';
import PropTypes from 'prop-types';
import 'react-splitter-layout/lib/index.css';

export default class Layout extends PureComponent {
    state = {
        lang: I18n.getLanguage(),
        currentRules: [],
        isOpen: false,
        isEdit: false,
        selectedRule: {},
    };

    componentDidMount() {
        this.setDataFromConfig();
    }

    getSelectedLanguageCommands = () => {
        const { lang } = this.state;

        return [
            { rule: I18n.t('Select rule'), unique: false },
            ...Object.values(commands).map(command => {
                const { name, ...rest } = command;
                const obj = {
                    ...rest,
                    rule: command?.name[lang],
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
            interupt: true,
        };

        const rule = {
            ...this.commands.find(command => command.rule === shortDataRule.rule),
            ...shortDataRule,
        };

        this.setState({
            currentRules: [...this.state.currentRules, rule],
            ruleWasUpdatedId: id,
            selectedRule: this.state.pendingChanges ? this.state.selectedRule : rule,
        });

        this.handleClose();
    };

    handleSubmitOnEdit = (selectedRule, isError) => {
        if (isError) return;

        this.updateRule(selectedRule);
        this.setState({});
        this.handleClose();
    };

    selectRule = id => {
        const { selectedRule, currentRules } = this.state;

        if (selectedRule.id === id) return;
        else if (this.state.pendingChanges) {
            this.setState({
                pendingSelectedRuleId: id,
            });
            return;
        } else {
            const rule = currentRules.find(item => item.id === id);

            this.setState({
                selectedRule: rule,
            });
        }
    };

    updatePendingState = bool => {
        if (this.state.pendingChanges === bool) return;

        this.setState({
            pendingChanges: bool,
            ruleWasUpdatedId: bool ? this.state.ruleWasUpdatedId : false,
        });
    };

    updateRule = selectedRule => {
        this.setState({
            currentRules: this.state.currentRules.map(item =>
                item.id === selectedRule.id ? selectedRule : item
            ),
            pendingChanges: false,
            ruleWasUpdatedId: false,
        });
    };

    handleEdit = () => {
        this.setState({
            isEdit: true,
        });
        this.handleOpen();
    };

    finishEdit = editableRule => {
        let updatedRule;

        const { rule, id, name, interupt } = editableRule;
        const initialSelectedRule = this.state.selectedRule;

        if (initialSelectedRule.rule !== rule) {
            const updatedRuleOptions = this.commands.find(command => command.rule === rule);
            updatedRule = {
                ...updatedRuleOptions,
                name,
                rule,
                id,
                interupt,
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
        this.setState(
            {
                currentRules: this.state.currentRules.filter(rule => rule.id !== id),
                selectedRule: {},
            },
            this.updateConfig
        );
    };

    updateConfig = rule => {
        const config = {
            ...this.state.settings,
            rules: this.state.currentRules,
        };
        this.props.saveConfig(config);

        this.setState({
            selectedRule: rule || this.state.selectedRule || {},
        });
    };

    setDataFromConfig = async () => {
        const { currentRules } = this.state;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;
        await this.setState({
            currentRules: rules,
            settings,
            pendingChanges: false,
            ruleWasUpdatedId: false,
            pendingSelectedRuleId: false,
        });
        if (this.state.currentRules.length !== currentRules.length) {
            this.setState({
                selectedRule: this.state.currentRules[this.state.currentRules.length - 1] || {},
            });
        }
    };

    clearStateOnComfirmModalUnmount = () => {
        this.setState({
            pendingChanges: false,
            pendingSelectedRuleId: false,
        });
    };

    render() {
        console.log(this.state);
        const { isEdit, isOpen, currentRules, selectedRule, ruleWasUpdatedId } = this.state;
        return (
            <>
                <SplitterLayout
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
                    />
                    <RightBar
                        selectedRule={selectedRule}
                        socket={this.props.socket}
                        updateRule={this.updateRule}
                        updateConfig={this.updateConfig}
                        setDataFromConfig={this.setDataFromConfig}
                        pendingSelectedRuleId={this.state.pendingSelectedRuleId}
                        selectRule={this.selectRule}
                        updatePendingState={this.updatePendingState}
                        clearStateOnComfirmModalUnmount={this.clearStateOnComfirmModalUnmount}
                        pendingChanges={this.state.pendingChanges}
                        ruleWasUpdatedId={ruleWasUpdatedId}
                    />
                </SplitterLayout>
                <Modal
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
            </>
        );
    }
}

Layout.propTypes = {
    socket: PropTypes.object.isRequired,
    readConfig: PropTypes.func.isRequired,
    saveConfig: PropTypes.func.isRequired,
};
