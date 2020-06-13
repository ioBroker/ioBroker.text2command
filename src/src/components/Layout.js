import React, { Component } from 'react';
import SplitterLayout from 'react-splitter-layout';
import { v4 as uuid } from 'uuid';
import I18n from '@iobroker/adapter-react/i18n';
import 'react-splitter-layout/lib/index.css';
import LeftBar from './LeftBar';
import RightBar from './RightBar';
import { commands } from '@admin/langModel';
import Modal from './Modal';
import PropTypes from 'prop-types';

export default class Layout extends Component {
    state = {
        lang: I18n.getLanguage(),
        currentRules: [],
        isOpen: false,
        isEdit: false,
        selectedRule: {},
    };
    componentDidMount() {
        this.setState({
            commands: this.getSelectedLanguageCommands(),
        });
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
                        default: arg.default || '',
                    })),
                    ack: command.ack && {
                        ...command.ack,
                        name: command.ack.name[lang],
                        default: command.ack?.default && command.ack.default[lang],
                    },
                };

                return obj;
            }),
        ];
    };

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

    handleSubmit = (selectedRule, isError) => {
        const id = uuid();

        const addNewRule = () =>
            this.setState({
                currentRules: [
                    ...this.state.currentRules,
                    {
                        ...selectedRule,
                        id,
                        interupt: true,
                    },
                ],
            });

        this.state.isEdit ? this.updateRule(selectedRule) : addNewRule();
        if (isError) return;
        this.handleClose();
    };

    selectRule = id => {
        const { selectedRule, currentRules, commands } = this.state;
        if (selectedRule.id === id) return;
        const shortDataRule = currentRules.find(item => item.id === id);
        const rule = !shortDataRule.words
            ? commands.find(command => command.rule === shortDataRule.rule)
            : {};
        this.setState({
            selectedRule: { ...rule, ...shortDataRule },
        });
    };

    updateRule = selectedRule => {
        this.setState({
            currentRules: this.state.currentRules.map(item =>
                item.id === selectedRule.id ? selectedRule : item
            ),
        });
    };

    handleEdit = id => {
        this.setState({
            isEdit: true,
        });
        this.selectRule(id);
        this.handleOpen();
    };

    finishEdit = editableRule => {
        let updatedRule;

        const { rule, id, name, interupt } = editableRule;
        const initialSelectedRule = this.state.selectedRule;

        if (initialSelectedRule.rule !== rule) {
            const updatedRuleOptions = this.state.commands.find(command => command.rule === rule);
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
        this.setState({
            currentRules: this.state.currentRules.filter(rule => rule.id !== id),
            selectedRule: {},
        });
    };

    render() {
        console.log(this.state);
        const { commands, isEdit, isOpen, currentRules, selectedRule } = this.state;
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
                    />
                </SplitterLayout>
                <Modal
                    commands={commands}
                    isEdit={isEdit}
                    handleSubmit={this.handleSubmit}
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
};
