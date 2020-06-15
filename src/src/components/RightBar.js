import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextField, Switch, Typography, withStyles, Box } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import I18n from '@iobroker/adapter-react/i18n';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';

const styles = theme => ({
    container: {
        width: '70%',
        padding: '20px 30px 30px 30px',
        boxShadow: `0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14),
        0px 1px 10px 0px rgba(0, 0, 0, 0.12)`,
    },
    textField: {
        flexBasis: '60%',
    },
    title: {
        marginBottom: theme.spacing(3.8),
    },
});

class RightBar extends Component {
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

        const { classes } = this.props;

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
                className={classes.textField}
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
            localRule: { args, ack, editable, interupt },
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
                _this.props.updateRule(_this.state.localRule);
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
        } = this.state;
        const { classes } = this.props;
        const handleSubmit = this.handleDialogSelectIdSubmit;

        console.log(this.state);

        return (
            <Box mt="30px">
                <Box className={classes.container} mx="auto">
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom={true}
                        className={classes.title}>
                        {name || 'Выберите правило'}
                    </Typography>
                    {this.createOptionsData().map(({ title, item, id }) => {
                        if (!item) return null;
                        return (
                            <Box display="flex" justifyContent="space-between" mb="10px" key={id}>
                                <Typography variant="h5" component="h2" align="left">
                                    {title}
                                </Typography>
                                {item}
                            </Box>
                        );
                    })}
                </Box>

                {this.state.showDialog && (
                    <DialogSelectID
                        socket={this.props.socket}
                        title={'Select ID'}
                        onClose={id => {
                            console.log(id);
                            this.setState({ showDialog: false });
                        }}
                        onOk={handleSubmit}
                    />
                )}
            </Box>
        );
    }
}

export default withStyles(styles)(RightBar);

RightBar.propTypes = {
    selectedRule: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
        rule: PropTypes.string,
        ack: PropTypes.shape({
            default: PropTypes.string,
            value: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
        }),
        arg: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                type: PropTypes.string,
                default: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
            })
        ),
        words: PropTypes.string,
    }).isRequired,
    socket: PropTypes.object.isRequired,
    updateRule: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};
