import React, { Component, useEffect } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import { TextField, Switch, Typography } from '@material-ui/core';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import PropTypes from 'prop-types';

export default class RightBar extends Component {
    defaultState = {
        words: 'Выберите правило',
        name: 'Выберите правило',
        interupt: false,
        editable: false,
        args: [
            {
                default: 'Параметр 1',
            },
            {
                default: 'Параметр 2',
            },
        ],
        ack: {
            name: '',
            default: `${I18n.t('Confirmation text')}`,
        },
    };

    state = {
        localRule: this.defaultState,
        showDialog: false,
    };

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.selectedRule?.name !== this.props.selectedRule?.name ||
            prevState.localRule?.name !== this.state.localRule?.name
        ) {
            if (!this.props.selectedRule.name) {
                this.setState({
                    localRule: this.defaultState,
                });
            } else {
                this.setState({
                    localRule: {
                        ...this.props.selectedRule,
                    },
                });
            }
            if (
                this.props.selectedRule.name !== this.state.localRule.name &&
                this.props.selectedRule.id !== this.state.localRule.id
            ) {
                this.props.updateRule(this.state.localRule);
            }
        }
    }

    createInput = ({
        value,
        label,
        onChange,
        type,
        onClick,
        disabled = this.state.localRule === this.defaultState,
        keywords,
        key,
        onSwitchChange,
    }) => {
        if (!value && !label && !keywords) return;

        return type !== 'checkbox' ? (
            <TextField
                label={label}
                id="outlined-basic"
                variant="outlined"
                size="small"
                disabled={disabled}
                value={value}
                onClick={onClick}
                onChange={onChange}
                key={key}
            />
        ) : (
            <FormControl>
                <FormControlLabel
                    value={value}
                    label={label}
                    labelPlacement={'start'}
                    control={
                        <Switch
                            onClick={onSwitchChange}
                            color={'primary'}
                            disabled={disabled}
                            checked={!!value}
                        />
                    }
                    key={key}
                />
            </FormControl>
        );
    };

    createOptionsData = (state = this.state) => {
        const {
            localRule: { words, args, ack, editable, interupt },
        } = state;

        const { t } = I18n;

        const handlers = this.createTextInputHandlers();
        const createInput = this.createInput;

        const isKeyWordsDisabled = () => {
            if (editable === 'undefined') return false;
            else if (editable === false) return true;
        };

        return [
            {
                title: `${t('Keywords')}:`,
                item: createInput({
                    value: this.state.localRule?.words || '',
                    onChange: handlers.keywordsText,
                    keywords: true,
                    disabled: isKeyWordsDisabled(),
                    key: 'keywords',
                }),
                id: 1,
            },
            {
                title: `${t('Interupt')}:`,
                item: createInput({
                    label: 'Прервать обработку',
                    type: 'checkbox',
                    value: interupt,
                    onSwitchChange: handlers.interuptOnSwitch,
                }),
                id: 2,
            },
            {
                title: `${t('Param')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[0]?.default,
                    label: args && args[0]?.name,
                    type: args && args[0]?.type,
                    onClick: this.handleSetDialogClick.bind(this, args && args[0]),
                    onSwitchChange: handlers.param1OnSwitch,
                    key: 'Param1',
                }),
                id: 3,
            },
            {
                title: `${t('Param')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[1]?.default,
                    label: args && args[1]?.name,
                    onChange: handlers.param2Text,
                    key: 'Param2',
                }),
                id: 4,
            },
            {
                title: `${t('Confirmation text')}:`,
                item: createInput({
                    value: ack && ack.default,
                    label: ack && ack.name,
                    type: ack && ack.type,
                    key: 'Confirmation text',
                    onChange: handlers.confirmText,
                    onSwitchChange: handlers.confirmOnSwitch,
                }),
                id: 5,
            },
        ];
    };

    createTextInputHandlers = () => {
        const _this = this;

        return {
            keywordsText(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        words: event.target.value,
                    },
                });
            },
            param2Text(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        args: _this.state.localRule.args.map((arg, index) =>
                            index > 0
                                ? {
                                      ...arg,
                                      default: event.target.value,
                                  }
                                : arg
                        ),
                    },
                });
            },
            confirmText(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        ack: {
                            ..._this.state.localRule.ack,
                            default: event.target.value,
                        },
                    },
                });
            },
            param1OnSwitch() {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        args: _this.state.localRule.args.map((arg, index) =>
                            !index ? { ...arg, default: !arg.default ? true : !arg.default } : arg
                        ),
                    },
                });
            },
            confirmOnSwitch() {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        ack: {
                            ..._this.state.localRule.ack,
                            default: !_this.state.localRule.ack.default,
                        },
                    },
                });
            },
            async interuptOnSwitch() {
                await _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        interupt: !_this.state.localRule.interupt,
                    },
                });
                await _this.props.updateRule(_this.state.localRule);
            },
        };
    };

    handleSetDialogClick = arg => {
        if (arg.type === 'id') {
            this.setState({
                showDialog: true,
            });
        }
    };

    handleDialogSelectIdSubmit = selected => {
        this.setState({
            localRule: {
                ...this.state.localRule,
                args: this.state.localRule.args.map((arg, index) =>
                    !index
                        ? {
                              ...arg,
                              default: selected,
                          }
                        : arg
                ),
            },
        });
    };

    render() {
        const {
            localRule: { name },
            newOptionsData,
        } = this.state;
        console.log(this.state);
        const handleSubmit = this.handleDialogSelectIdSubmit;

        return (
            <div className="right-bar">
                <div className="right-bar__container">
                    <Typography variant="h4" align="center" gutterBottom={true}>
                        {name || 'Выберите правило'}
                    </Typography>
                    {this.createOptionsData().map(({ title, item, id }) => {
                        if (!item) return null;
                        return (
                            <div className="custom-card" key={id}>
                                <Typography variant="h5" component="h2" align="left">
                                    {title}
                                </Typography>
                                {item}
                            </div>
                        );
                    })}
                </div>

                {this.state.showDialog && (
                    <DialogSelectID
                        connection={this.props.socket}
                        title={'Select ID'}
                        onClose={() => this.setState({ showDialog: false })}
                        onOk={handleSubmit}
                    />
                )}
            </div>
        );
    }
}

RightBar.propTypes = {
    selectedRule: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    socket: PropTypes.object.isRequired,
    updateRule: PropTypes.func.isRequired,
};
