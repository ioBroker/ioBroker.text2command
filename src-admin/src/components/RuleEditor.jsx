import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
    TextField,
    Switch,
    Typography,
    Box,
    FormLabel,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    FormControl,
    Button,
    Paper,
    Toolbar,
    IconButton,
} from '@mui/material';

import {
    ArrowBack as ArrowBackIcon,
    Menu as MenuIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

import { I18n, DialogSelectID } from '@iobroker/adapter-react-v5';

const styles = {
    root: {
        width: '100%',
        height: '100%',
        padding: 0,
        margin: 0,
        position: 'relative',
    },
    box: theme => ({
        display: 'inline-flex',
        justifyContent: 'space-around',
        position: 'relative',
        '& .outlined-basic': {
            padding: '12px 10px',
            // border: `2px solid ${theme.palette.grey[700]}`,
        },
        [theme.breakpoints.down('md')]: {
            '& .outlined-basic': {
                padding: 0,
            },
        },
    }),
    boxMobile: {
        padding: 0,
        width: '100%',
        height: 'calc(100% - 48px - 48px)',
        overflow: 'auto',
    },
    boxDesktop: {
        padding: 8,
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 48px - 48px - 16px)',
        overflow: 'auto',
    },
    container: theme => ({
        width: '100%',
        padding: '16px',
        overflow: 'auto',
        [theme.breakpoints.down('md')]: {
            width: 'calc(100% - 24px)',
            padding: '8px',
        },
    }),
    submitForm: theme => ({
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'right',
        width: '100%',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    }),
    mainTitle: {
        marginBottom: '30px',
    },
    rowSpace: {
        marginBottom: 16,
    },
    title: {
        whiteSpace: 'nowrap',
    },
    row: theme => ({
        [theme.breakpoints.down('md')]: {
            alignItems: 'center',
        },
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'center',
        },
    }),
    btnDanger: theme => ({
        marginLeft: '8px',
        [theme.breakpoints.down('xs')]: {
            marginLeft: 0,
            marginTop: '4px',
        },
        // backgroundColor: theme.palette.error?.dark,
    }),
    saveAndGoBtn: theme => ({
        marginRight: '20px',
        [theme.breakpoints.down('xs')]: {
            marginRight: 0,
            marginBottom: '4px',
        },
    }),
    toggleIcon: theme => ({
        position: 'absolute',
        zIndex: 1,
        opacity: 0.8,
        top: 8,
        left: 0,
        backgroundColor: theme.palette.primary.main,
        width: 18,
        height: 25,
        cursor: 'pointer',
        padding: '4px 8px 4px 2px',
        color: '#FFF',
        borderRadius: '0 5px 5px 0',
    }),
    switchControl: {
        marginTop: -5,
    },
    emptyButtons: theme => ({
        [theme.breakpoints.down('sm')]: {
            height: 0,
        },
    }),
    header: theme => ({
        backgroundColor: theme.palette.secondary.main,
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: '40px',
        zIndex: 0,
        color: '#FFF',
    }),
    inputOid: {
        width: 'calc(100% - 60px)',
        display: 'inline-block',
    },
    inputOidButton: {
        minWidth: 40,
        display: 'inline-block',
        marginLeft: 8,
    },
    textField: {
        width: 'calc(100% - 12px)',
    },
    rowPadding: {
        marginBottom: 8,
    },
};

export default class RuleEditor extends PureComponent {
    constructor(props) {
        super(props);

        /* this.defaultState = {
            words: I18n.t('Create Rule'),
            name: I18n.t('Create Rule'),
            _break: false,
            editable: false,
            args: [
                {
                    default: `${I18n.t('Argument')} 1`,
                },
                {
                    default: `${I18n.t('Argument')} 2`,
                },
            ],
            ack: {
                name: '',
                default: `${I18n.t('Confirmation text')}`,
            },
            id: 0,
        }; */

        this.state = {
            localRule: null,
            showDialog: false,
            editIndex: 0,
        };

        this.handlers = this.createInputHandlers();
    }

    static getDerivedStateFromProps(props, state) {
        if (
            (!props.selectedRule && state.localRule) ||
            (props.selectedRule && !state.localRule) ||
            props.selectedRule?.id !== state.localRule?.id
        ) {
            return {
                localRule: { ...props.selectedRule },
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.selectedRule?.name !== this.props.selectedRule?.name ||
            prevState.localRule?.name !== this.state.localRule?.name
        ) {
            if (!this.props.selectedRule || !this.props.selectedRule.name) {
                this.setState({
                    localRule: null,
                });
            } else {
                this.setState({
                    localRule: {
                        ...this.props.selectedRule,
                    },
                });
            }
        } else if (this.state.isLocalStateWasUpdated) {
            const unsavedRule = this.props.unsavedRules[this.state.localRule.id];

            if (
                JSON.stringify(this.props.selectedRule) === JSON.stringify(this.state.localRule) &&
                !unsavedRule?.wasChangedGlobally
            ) {
                this.setState({ isLocalStateWasUpdated: false });

                if (!unsavedRule?.wasChangedGlobally) {
                    this.props.removeUnsavedRule(this.state.localRule.id);
                }
            } else if (!unsavedRule && !this.props.pendingSelectedRuleId) {
                this.props.setUnsavedRule(this.state.localRule.id);
            }
        } else if (!this.state.isLocalStateWasUpdated && this.props.unsavedRules[this.state.localRule.id]) {
            this.setState({ isLocalStateWasUpdated: true });
        }

        if (this.props.pendingSelectedRuleId && this.state.isLocalStateWasUpdated) {
            if (this.props.pendingSelectedRuleId === this.state.localRule.id) {
                return;
            }
            this.setState({ confirmChanges: true });
        }

        if (this.props.lang !== prevProps.lang) {
            this.forceUpdate();
        }
    }

    componentDidMount() {
        if (!this.state.localRule && this.props.selectedRule) {
            this.setState({
                localRule: this.props.selectedRule,
            });
        }
    }

    createConfirmModalActions = () => {
        const { t } = I18n;
        const {
            updateConfig,
            selectRule,
            pendingSelectedRuleId,
            clearStateOnConfirmModalUnmount,
            revertChangesFromConfig,
        } = this.props;
        const { localRule } = this.state;

        const cancelSavingChanges = async () => {
            await clearStateOnConfirmModalUnmount();
            this.closeConfirmDialog();
        };

        const dontSaveAndGo = async () => {
            await revertChangesFromConfig(localRule);
            await selectRule(pendingSelectedRuleId);
            await clearStateOnConfirmModalUnmount(localRule.id);

            this.closeConfirmDialog();
        };
        const handleSaveAndGo = async () => {
            await updateConfig(localRule);
            await selectRule(pendingSelectedRuleId);
            await clearStateOnConfirmModalUnmount();

            this.closeConfirmDialog();
        };
        return (
            <FormControl
                sx={styles.submitForm}
                variant="standard"
            >
                <div style={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    onClick={handleSaveAndGo}
                    color="primary"
                    startIcon={<CheckIcon />}
                    sx={styles.saveAndGoBtn}
                >
                    {t('Save and go')}
                </Button>
                <Button
                    onClick={dontSaveAndGo}
                    variant="contained"
                    color="secondary"
                    startIcon={<CheckIcon />}
                >
                    {t("Don't save and go")}
                </Button>
                <Button
                    color="grey"
                    variant="contained"
                    sx={styles.btnDanger}
                    startIcon={<CloseIcon />}
                    onClick={cancelSavingChanges}
                >
                    {t('Cancel')}
                </Button>
            </FormControl>
        );
    };

    createSaveSettingsForm = () => {
        const { t } = I18n;
        const { updateConfig, revertChangesFromConfig, selectedRule } = this.props;
        const { localRule } = this.state;

        const handleSave = async () => {
            await updateConfig(localRule);
            this.setState({ isLocalStateWasUpdated: false });
        };

        const revertChanges = async () => {
            await revertChangesFromConfig(localRule);

            await this.setState({
                localRule: selectedRule,
                isLocalStateWasUpdated: false,
            });
        };

        if (!this.state.isLocalStateWasUpdated) {
            return <Box sx={styles.emptyButtons} />;
        }
        return (
            <FormControl
                sx={styles.submitForm}
                variant="standard"
            >
                <div style={{ flexGrow: 1 }} />
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<CheckIcon />}
                    color="primary"
                >
                    {t('Save')}
                </Button>
                <Button
                    color="grey"
                    variant="contained"
                    sx={styles.btnDanger}
                    startIcon={<CloseIcon />}
                    onClick={revertChanges}
                >
                    {t('Cancel')}
                </Button>
            </FormControl>
        );
    };

    closeConfirmDialog = () => {
        this.setState({
            isLocalStateWasUpdated: false,
            confirmChanges: false,
        });
    };

    createInput = ({
        value,
        label,
        onChange,
        type,
        onOpenSelectDialog,
        note,
        disabled = !this.state.localRule,
        keywords,
        key,
        onSwitchChange,
        isMobile,
    }) => {
        if ((value === undefined || value === null) && !label && !keywords) {
            return null;
        }

        if (onOpenSelectDialog) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
                    <TextField
                        variant="standard"
                        styles={styles.inputOid}
                        fullWidth
                        label={isMobile ? label : ''}
                        size="small"
                        disabled={disabled}
                        value={value === undefined || value === null ? '' : value}
                        helperText={note || ''}
                        onChange={onChange}
                        key={key}
                        slotProps={{
                            input: {
                                endAdornment: value ? (
                                    <IconButton onClick={() => onChange({ target: { value: '' } })}>
                                        <CloseIcon />
                                    </IconButton>
                                ) : undefined,
                            },
                        }}
                    />
                    <Button
                        color="grey"
                        onClick={() => onOpenSelectDialog(value)}
                        size="small"
                        style={styles.inputOidButton}
                        variant="outlined"
                    >
                        ...
                    </Button>
                </div>
            );
        }
        if (type !== 'checkbox') {
            return (
                <TextField
                    variant="standard"
                    label={isMobile ? label : ''}
                    size="small"
                    fullWidth
                    disabled={disabled}
                    value={value === undefined || value === null ? '' : value}
                    helperText={note || ''}
                    onChange={onChange}
                    key={key}
                    styles={{
                        ...styles.rowPadding,
                        ...styles.textField,
                    }}
                    type={type === 'number' ? 'number' : 'text'}
                    slotProps={{
                        input: {
                            endAdornment: value ? (
                                <IconButton onClick={() => onChange({ target: { value: '' } })}>
                                    <CloseIcon />
                                </IconButton>
                            ) : undefined,
                        },
                    }}
                />
            );
        }
        return (
            <FormControl
                style={styles.switchControl}
                variant="standard"
            >
                <Switch
                    key={key}
                    onClick={onSwitchChange}
                    color="primary"
                    disabled={disabled}
                    checked={!!value}
                />
                {isMobile ? <FormLabel>{label}</FormLabel> : null}
            </FormControl>
        );
    };

    createOptionsData = (state = this.state) => {
        const {
            localRule: { args, ack, editable, _break },
        } = state;
        const { t } = I18n;

        const createInput = this.createInput;
        const handlers = this.handlers;

        const isKeyWordsDisabled = () => {
            if (editable === undefined) {
                return false;
            }

            return editable === false;
        };

        return [
            {
                title: t('Keywords'),
                item: createInput({
                    value: this.state.localRule?.words || '',
                    onChange: handlers.keywordsText,
                    keywords: true,
                    disabled: isKeyWordsDisabled(),
                    key: 'keywords',
                    label: t('Keywords'),
                    isMobile: this.props.isMobile,
                }),
                id: 1,
            },
            {
                title: t('Interrupt processing'),
                item: createInput({
                    type: 'checkbox',
                    value: _break,
                    onSwitchChange: handlers.breakOnSwitch,
                    key: 'break',
                    label: t('Interrupt processing'),
                    isMobile: this.props.isMobile,
                }),
                id: 2,
            },
            {
                title: args && args[0]?.name, // `${t('Argument')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[0]?.default,
                    type: args && args[0]?.type,
                    onOpenSelectDialog: selectedId => this.openSelectIdDialog(args && args[0], selectedId, 0),
                    onSwitchChange: handlers.param1OnSwitch,
                    key: 'Param1',
                    label: args && args[0]?.name, // `${t('Argument')}:`,
                    isMobile: this.props.isMobile,
                }),
                id: 3,
            },
            {
                title: args && args[1]?.name, // `${t('Argument')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[1]?.default,
                    type: args && args[1]?.type,
                    onChange: handlers.param2Text,
                    onSwitchChange: handlers.param2OnSwitch,
                    key: 'Param2',
                    label: args && args[1]?.name, // `${t('Argument')}:`,
                    isMobile: this.props.isMobile,
                }),
                id: 4,
            },
            {
                title: args && args[2]?.name, // `${t('Argument')}:`,
                item: createInput({
                    value: args && this.state.localRule.args[2]?.default,
                    type: args && args[2]?.type,
                    onOpenSelectDialog: selectedId => this.openSelectIdDialog(args && args[2], selectedId, 2),
                    onSwitchChange: handlers.param3OnSwitch,
                    key: 'Param3',
                    label: args && args[2]?.name, // `${t('Argument')}:`,
                    isMobile: this.props.isMobile,
                }),
                id: 5,
            },
            {
                title: t('Confirmation text'),
                item: createInput({
                    value: ack && ack.default,
                    // label: ack && ack.name,
                    note: t(
                        'You can use %s, that will be replaced with current value of state. %u will be replaced by unit',
                    ),
                    type: ack && ack.type,
                    key: 'confirmationText',
                    onChange: handlers.confirmText,
                    onSwitchChange: handlers.confirmOnSwitch,
                    label: t('Confirmation text'),
                    isMobile: this.props.isMobile,
                }),
                id: 6,
            },
        ];
    };

    createInputHandlers = () => {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;

        return {
            keywordsText(event) {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        words: event.target.value,
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param2Text(event) {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        args: that.state.localRule.args.map((arg, index) =>
                            index > 0
                                ? {
                                      ...arg,
                                      default: event.target.value,
                                  }
                                : arg,
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            confirmText(event) {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        ack: {
                            ...that.state.localRule.ack,
                            default: event.target.value,
                        },
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param1OnSwitch() {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        args: that.state.localRule.args.map((arg, index) =>
                            index === 0 ? { ...arg, default: !arg.default ? true : !arg.default } : arg,
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param2OnSwitch() {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        args: that.state.localRule.args.map((arg, index) =>
                            index === 1 ? { ...arg, default: !arg.default ? true : !arg.default } : arg,
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            param3OnSwitch() {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        args: that.state.localRule.args.map((arg, index) =>
                            index === 2 ? { ...arg, default: !arg.default ? true : !arg.default } : arg,
                        ),
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            confirmOnSwitch() {
                that.setState({
                    localRule: {
                        ...that.state.localRule,
                        ack: {
                            ...that.state.localRule.ack,
                            default: !that.state.localRule.ack.default,
                        },
                    },
                    isLocalStateWasUpdated: true,
                });
            },
            async breakOnSwitch() {
                await that.setState({
                    localRule: {
                        ...that.state.localRule,
                        _break: !that.state.localRule._break,
                    },
                    isLocalStateWasUpdated: true,
                });
            },
        };
    };

    openSelectIdDialog = (arg, selectedId, editIndex) => {
        if (arg.type === 'id') {
            this.setState({ showDialog: true, showDialogId: selectedId, editIndex });
        }
    };

    onIDSelected = selected => {
        this.setState({
            localRule: {
                ...this.state.localRule,
                args: this.state.localRule.args.map((arg, index) =>
                    index === this.state.editIndex
                        ? {
                              ...arg,
                              default: selected,
                          }
                        : arg,
                ),
            },
            isLocalStateWasUpdated: true,
            editIndex: 0,
        });
    };

    renderConfirmDialog() {
        if (!this.state.confirmChanges) {
            return null;
        }
        return (
            <Dialog
                fullWidth
                open={this.state.confirmChanges}
                maxWidth="md"
            >
                <DialogTitle>{I18n.t('Please confirm or cancel changes before leaving')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {`${I18n.t('You have changed rule')}: `} <strong>{this.state.localRule.name}</strong>
                    </Typography>
                    <DialogActions>{this.createConfirmModalActions()}</DialogActions>
                </DialogContent>
            </Dialog>
        );
    }

    renderSelectIdDialog() {
        return this.state.showDialog ? (
            <DialogSelectID
                imagePrefix="../.."
                theme={this.props.theme}
                socket={this.props.socket}
                title="Select ID"
                selected={this.state.showDialogId}
                onClose={() => this.setState({ showDialog: false })}
                onOk={id => this.onIDSelected(id)}
            />
        ) : null;
    }

    render() {
        const { localRule } = this.state;

        const { isLeftBarOpen, toggleLeftBar } = this.props;
        const name = localRule ? localRule.name : '';

        if (!this.props.selectedRule) {
            return null;
        }

        return (
            <Box sx={styles.root}>
                <Box
                    sx={styles.toggleIcon}
                    onClick={toggleLeftBar}
                >
                    {isLeftBarOpen || this.props.isMobile ? <MenuIcon /> : <ArrowBackIcon />}
                </Box>
                <Toolbar
                    position="static"
                    variant="dense"
                    sx={styles.header}
                >
                    {name}
                </Toolbar>

                <Box
                    sx={styles.box}
                    style={this.props.isMobile ? styles.boxMobile : styles.boxDesktop}
                    key={this.props.selectedRule ? this.props.selectedRule.id : 'emptyLeft'}
                >
                    {localRule ? (
                        <Paper sx={styles.container}>
                            <div
                                style={
                                    this.props.isMobile
                                        ? { width: '100%' }
                                        : { display: 'grid', gridTemplateColumns: 'minmax(50px, 265px) 1fr' }
                                }
                            >
                                {this.createOptionsData().map(({ title, item /* , id */ }) => {
                                    if (!item) {
                                        return null;
                                    }

                                    return [
                                        !this.props.isMobile ? (
                                            <div
                                                key={1}
                                                style={{ ...styles.title, ...styles.rowSpace }}
                                            >
                                                {title}
                                            </div>
                                        ) : null,
                                        <div
                                            key={2}
                                            style={styles.rowSpace}
                                        >
                                            {item}
                                        </div>,
                                    ];
                                })}
                            </div>
                        </Paper>
                    ) : null}

                    {this.renderSelectIdDialog()}
                    {this.renderConfirmDialog()}
                </Box>

                {localRule ? (
                    <Toolbar
                        position="static"
                        variant="dense"
                        sx={styles.header}
                    >
                        {this.createSaveSettingsForm()}
                    </Toolbar>
                ) : null}
            </Box>
        );
    }
}

RuleEditor.propTypes = {
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
            }),
        ),
        words: PropTypes.string,
    }).isRequired,
    theme: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    revertChangesFromConfig: PropTypes.func.isRequired,
    selectRule: PropTypes.func.isRequired,
    pendingSelectedRuleId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    clearStateOnConfirmModalUnmount: PropTypes.func.isRequired,
    unsavedRules: PropTypes.object.isRequired,
    setUnsavedRule: PropTypes.func.isRequired,
    removeUnsavedRule: PropTypes.func.isRequired,
    toggleLeftBar: PropTypes.func.isRequired,
    isLeftBarOpen: PropTypes.bool,
    isMobile: PropTypes.bool.isRequired,
};
