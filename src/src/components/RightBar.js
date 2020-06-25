import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { TextField, Switch, Typography, withStyles, Box } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import I18n from '@iobroker/adapter-react/i18n';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import isEqual from 'lodash.isequal';

const styles = theme => ({
    box: {
        display: 'inline-flex',
        justifyContent: 'space-around',
        padding: theme.spacing(2),
        width: 'calc(100% - ' + theme.spacing(4) + 'px)'
    },
    container: {
        width: '70%',
        minWidth: 400,
        padding: theme.spacing(2),
    },
    textField: {
        flexBasis: '60%',
    },
    submitForm: {
        flexDirection: 'row',
        margin: '10px auto 20px',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
    },
    title: {
        marginBottom: '30px',
    },
    btnDanger: {
        marginLeft: 20,
        //backgroundColor: theme.palette.error?.dark,
    },
    saveAndGoBtn: {
        marginRight: 20,
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
        } else if (this.state.isLocalStateWasUpdated) {
            if (
                isEqual(this.props.selectedRule, this.state.localRule) &&
                !this.props.ruleWasUpdatedId
            ) {
                this.setState({
                    isLocalStateWasUpdated: false,
                });
                this.props.updatePendingState(false);
            } else {
                this.props.updatePendingState(true);
            }
        } else if (
            this.props.ruleWasUpdatedId === this.props.selectedRule.id &&
            !this.state.isLocalStateWasUpdated &&
            this.props.ruleWasUpdatedId
        ) {
            this.setState({
                isLocalStateWasUpdated: true,
            });
        }
        if (this.props.pendingSelectedRuleId && this.state.isLocalStateWasUpdated) {
            if (this.props.pendingSelectedRuleId === this.state.localRule.id) return;
            this.setState({
                confirmChanges: true,
            });
        }

        if (this.props.lang !== prevProps.lang) {
        }
    }

    createConfirmModalActions = () => {
        const { t } = I18n;
        const { updateConfig, classes, selectRule, pendingSelectedRuleId } = this.props;

        const cancelSavingChanges = async () => {
            await this.props.clearStateOnConfirmModalUnmount();
            await this.setState({
                confirmChanges: false,
                isLocalStateWasUpdated: true,
            });
        };
        const dontSaveAndGo = async () => {
            if (this.props.ruleWasUpdatedId === this.state.localRule.id) {
                await this.props.revertChangesFromConfig(this.state.localRule);
                await this.setState({
                    isLocalStateWasUpdated: false,
                    confirmChanges: false,
                });
            } else {
                await this.setState({
                    isLocalStateWasUpdated: false,
                    confirmChanges: false,
                });
                await this.props.updatePendingState(false, this.state.localRule.id);
            }

            await selectRule(pendingSelectedRuleId);

            this.props.clearStateOnConfirmModalUnmount();
        };
        const handleSaveAndGo = async () => {
            if (this.props.ruleWasUpdatedId === this.state.localRule.id) {
                await updateConfig(this.state.localRule);
                await this.setState({
                    isLocalStateWasUpdated: false,
                    confirmChanges: false,
                });
            } else {
                await this.setState({
                    isLocalStateWasUpdated: false,
                    confirmChanges: false,
                });
                await updateConfig(this.state.localRule);
            }

            await selectRule(pendingSelectedRuleId);
            this.props.clearStateOnConfirmModalUnmount();
        };
        return (
            <FormControl className={classes.submitForm}>
                <Button
                    variant="contained"
                    onClick={handleSaveAndGo}
                    color="primary"
                    className={classes.saveAndGoBtn}>
                    {t('Save and go')}
                </Button>
                <Button onClick={dontSaveAndGo} variant="contained" color="secondary">
                    {t(`Don't save and go`)}
                </Button>
                <Button
                    variant="contained"
                    className={classes.btnDanger}
                    onClick={cancelSavingChanges}>
                    {t('Cancel')}
                </Button>
            </FormControl>
        );
    };

    createSaveSettingsForm = () => {
        const { t } = I18n;
        const {
            updateConfig,
            classes,
            revertChangesFromConfig,
            clearStateOnConfirmModalUnmount,
        } = this.props;

        const handleSave = async () => {
            this.setState({
                isLocalStateWasUpdated: false,
                confirmChanges: false,
            });
            await updateConfig(this.state.localRule);
        };

        const revertChanges = async () => {
            await revertChangesFromConfig(this.state.localRule);
            await this.setState({
                localRule: this.props.selectedRule,
                isLocalStateWasUpdated: false,
            });
            clearStateOnConfirmModalUnmount();
        };

        return (
            <FormControl className={classes.submitForm}>
                <Button onClick={handleSave} variant="contained" color="primary">
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
                title: `${t('Interrupt')}:`,
                item: createInput({
                    label: `${t('Interrupt processing')}`,
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
                _this.props.updateCurrentRules(_this.state.localRule);
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
        } = this.state;
        const { classes } = this.props;

        const handleSubmit = this.handleDialogSelectIdSubmit;
        const SaveSettingsForm = this.createSaveSettingsForm({});

        console.log(this.state);

        return (
            <Box mt="30px" className={classes.box}>
                <Paper className={classes.container} mx="auto">
                    <Typography
                        variant="h4"
                        align="center"
                        className={!isLocalStateWasUpdated ? classes.title : ''}>
                        {name}
                    </Typography>

                    {isLocalStateWasUpdated && SaveSettingsForm}

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
                </Paper>

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
                {this.state.confirmChanges && (
                    <Dialog fullWidth open={this.state.confirmChanges} maxWidth={'md'}>
                        <DialogTitle>
                            {I18n.t('Please confirm or cancel changes before leaving')}
                        </DialogTitle>
                        <DialogContent>
                            <Typography>
                                {I18n.t('You have changed rule') + ': '} <strong>{name}</strong>
                            </Typography>
                            <DialogActions>{this.createConfirmModalActions()}</DialogActions>
                        </DialogContent>
                    </Dialog>
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
    socket: PropTypes.object.isRequired,
    updateCurrentRules: PropTypes.func.isRequired,
    updateConfig: PropTypes.func.isRequired,
    revertChangesFromConfig: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    selectRule: PropTypes.func.isRequired,
    pendingSelectedRuleId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    updatePendingState: PropTypes.func.isRequired,
    clearStateOnConfirmModalUnmount: PropTypes.func.isRequired,
    pendingChanges: PropTypes.bool,
    ruleWasUpdatedId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};
