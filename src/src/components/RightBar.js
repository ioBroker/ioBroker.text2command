import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { TextField, Switch, Typography, withStyles, Box } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import I18n from '@iobroker/adapter-react/i18n';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import isEqual from 'lodash.isequal';

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
    submitForm: {
        flexDirection: 'row',
        margin: '10px auto 20px',
        display: 'flex',
        justifyContent: 'center',
        width: '30%',
    },
    title: {
        marginBottom: '30px',
    },
    btnDanger: {
        marginLeft: 20,
        backgroundColor: theme.palette.error?.dark,
    },
});

class RightBar extends PureComponent {
    defaultState = {
        words: I18n.t('Select rule'),
        name: I18n.t('Select rule'),
        interupt: false,
        editable: false,
        args: [
            {
                default: I18n.t('Argument') + ' 1',
            },
            {
                default: I18n.t('Argument') + ' 2',
            },
        ],
        ack: {
            name: '',
            default: `${I18n.t('Confirmation text')}`,
        },
        id: 0,
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
            // if (
            //     this.props.selectedRule.name !== this.state.localRule.name &&
            //     this.props.selectedRule.id !== this.state.localRule.id
            // ) {
            //     this.props.updateRule(this.state.localRule);
            // }
        } else if (this.state.isLocalStateWasUpdated) {
            if (isEqual(this.props.selectedRule, this.state.localRule)) {
                this.setState({
                    isLocalStateWasUpdated: false,
                });
            }
        }
    }

    createSaveSettingsForm = () => {
        const { t } = I18n;
        const { updateConfig, updateRule, classes, setDataFromConfig } = this.props;

        const handleSave = async () => {
            await updateRule(this.state.localRule);
            await updateConfig();
            this.setState({
                isLocalStateWasUpdated: false,
            });
        };

        const revertChanges = async () => {
            await setDataFromConfig();
            this.setState({
                localRule: this.props.selectedRule,
                isLocalStateWasUpdated: false,
            });
        };

        return (
            <FormControl className={classes.submitForm}>
                <Button onClick={handleSave} variant="contained" color="secondary">
                    {t('Save')}
                </Button>
                <Button variant="contained" className={classes.btnDanger} onClick={revertChanges}>
                    {t('Cancel')}
                </Button>
            </FormControl>
        );
    };

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

        const createInput = this.createInput;
        const handlers = this.handlers;

        const isKeyWordsDisabled = () => {
            if (editable === undefined) return false;
            else if (editable === false) return true;
            return false;
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
                    label: `${t('Interupt processing')}`,
                    type: 'checkbox',
                    value: interupt,
                    onSwitchChange: handlers.interuptOnSwitch,
                    key: 'interupt',
                }),
                id: 2,
            },
            {
                title: `${t('Argument')}:`,
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
                title: `${t('Argument')}:`,
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

    createInputHandlers = () => {
        const _this = this;

        return {
            keywordsText(event) {
                _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        words: event.target.value,
                    },
                    isLocalStateWasUpdated: true,
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
                    isLocalStateWasUpdated: true,
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
                    isLocalStateWasUpdated: true,
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
                    isLocalStateWasUpdated: true,
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
                    isLocalStateWasUpdated: true,
                });
            },
            async interuptOnSwitch() {
                await _this.setState({
                    localRule: {
                        ..._this.state.localRule,
                        interupt: !_this.state.localRule.interupt,
                    },
                    isLocalStateWasUpdated: true,
                });
                _this.props.updateRule(_this.state.localRule);
            },
        };
    };

    handlers = this.createInputHandlers();

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
            isLocalStateWasUpdated,
            localRule,
        } = this.state;
        const { classes, isGlobalStateWasUpdated } = this.props;

        const handleSubmit = this.handleDialogSelectIdSubmit;
        const SaveSettingsForm = this.createSaveSettingsForm();
        const isStateDefault = localRule === this.defaultState;

        console.log('rerender');

        return (
            <Box mt="30px">
                <Box className={classes.container} mx="auto">
                    {isGlobalStateWasUpdated && isStateDefault ? (
                        SaveSettingsForm
                    ) : (
                        <Typography
                            variant="h4"
                            align="center"
                            className={
                                !isLocalStateWasUpdated && !isGlobalStateWasUpdated
                                    ? classes.title
                                    : ''
                            }>
                            {name}
                        </Typography>
                    )}

                    {(isLocalStateWasUpdated || isGlobalStateWasUpdated) &&
                        !isStateDefault &&
                        SaveSettingsForm}

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
            default: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
        arg: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                type: PropTypes.string,
                default: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
            })
        ),
        words: PropTypes.string,
    }).isRequired,
    isGlobalStateWasUpdated: PropTypes.bool,
    socket: PropTypes.object.isRequired,
    updateRule: PropTypes.func.isRequired,
    updateConfig: PropTypes.func.isRequired,
    setDataFromConfig: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};
