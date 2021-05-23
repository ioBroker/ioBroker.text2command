import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withStyles from '@material-ui/core/styles/withStyles';

// Material UI Components
import DialogActions from '@material-ui/core/DialogActions';
import Toolbar from '@material-ui/core/Toolbar';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

// icons
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import CachedIcon from '@material-ui/icons/Cached';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import FormatClearIcon from '@material-ui/icons/FormatClear';
import ClearIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';

import I18n from '@iobroker/adapter-react/i18n';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';

import Rule from './Rule';

const styles = theme => ({
    test: {
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: theme.spacing(1)
    },
    main: {
        minWidth: 300,
        overflow: 'hidden',
        height: '100%',
    },
    toolbar: {
        background: theme.palette.primary.main,
        position: 'relative',
    },
    list: {
        height: 'calc(100% - 48px - 48px - 18px)',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    root: {
        width: 'calc(100% - 48px)',
        // '& .MuiInputLabel-outlined-70.MuiInputLabel-marginDense-66': {
        //     transform: '',
        // },
    },
    header: {
        minHeight: 44,
        height: 'auto',
        padding: theme.spacing(1.3),
        border: `1px solid ${theme.palette.divider}`,
    },
    textInput: {
        width: '60%',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    settingsTitle: {
        fontSize: '20px',
        maxWidth: 145,
        [theme.breakpoints.down('sm')]: {
            marginBottom: theme.spacing(1),
        },
    },
    settingsContent: {
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            display: 'flex',
        },
    },
    closeBtn: {
        position: 'absolute',
        top: 0,
        right: 0,
        color: theme.palette.common.white,
    },
    iconNotAlive: {
        color: '#ffc10a',
        float: 'right'
    },
    search: {
        flexBasis: '80%',
        [theme.breakpoints.down('sm')]: {
            flexBasis: '70%',
        },
    },
    settingsItem: {
        marginBottom: theme.spacing(3),
    },
    width100: {
        width: '100%',
    },
});

const tooltipStyles = theme => ({
    tooltip: {
        fontSize: 14,
    },
});

const CustomTooltip = withStyles(tooltipStyles)(Tooltip);

class Drawer extends Component {
    state = {
        textCommand: '',
        matchingRules: [],
        isSettingsDialogOpen: false,
        isConfirmRemoveDialogOpen: false,
        isSearchActive: false,
        filteredRules: [],
        searchedValue: '',
        localSettings: {
            language: '',
            processorId: '',
            processorTimeout: 1000,
            sayitInstance: '',
        },
        toast: null,
        alive: false,
    };

    componentDidMount() {
        this.props.socket.subscribeState('text2command.' + this.props.instance + '.response', this.onResponse);
        this.props.socket.subscribeState('system.adapter.text2command.' + this.props.instance + '.alive', this.onAlive);
        if (this.props.selectedRule && this.props.selectedRule.id) {
            //scroll to
            setTimeout(() => {
                const rules = window.document.getElementsByClassName('rule-selected');
                if (rules.length) {
                    rules[0].scrollIntoView()
                }
            }, 50);
        }
    }

    componentWillUnmount() {
        this.props.socket.unsubscribeState('text2command.' + this.props.instance + '.response', this.onResponse);
        this.props.socket.unsubscribeState('system.adapter.text2command.' + this.props.instance + '.alive', this.onAlive);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.settings !== prevProps.settings && this.props.settings) {
            this.getDefaultSettings();
        }
    }

    getDefaultSettings = () => {
        this.setState({
            localSettings: {
                ...this.props.settings,
            },
        });
    };

    onAlive = (id, state) => {
        if (state && state.val) {
            !this.state.alive && this.setState({alive: true});
        } else {
            this.state.alive && this.setState({alive: false});
        }
    };

    onResponse = (id, state) => {
        if (this.state.toast === null) {
            this.setState({toast: '', toastError: false});
        } else
        if (state) {
            if (state.val && state.val.match(/^Error\.|^Fehler\.|^Ошибка\./)) {
                this.props.socket.getState('text2command.' + this.props.instance + '.error')
                    .then(state =>
                        this.setState({toast: state && state.val ? state.val : (state.val || ''), toastError: true}));
            } else {
                this.setState({toast: state.val || '', toastError: false});
            }
        }
    };

    handleTextCommand = event => {
        this.setState({textCommand: event.target.value}, () => {
            this.testTimer && clearTimeout(this.testTimer);
            this.testTimer = setTimeout(() => {
                const matched = this.findMatchingRules();
                this.setState({
                    matchingRules: matched.map((number, index) => ({
                        indexOf: number,
                        timer: index * 1500,
                        index,
                    })),
                });
            }, 500);
        });
    };

    handleSubmit = (event, iconPlay) => {
        if ((event && event.key === 'Enter') || iconPlay) {
            this.props.socket.setState('text2command.' + this.props.instance + '.text', this.state.textCommand)
                .catch(err => console.error(err));

            if (!this.state.alive) {
                this.setState({toast: I18n.t('Instance is not running'), toastError: true});
            }
        }
    };

    removeMatched = () => {
        this.setState({
            matchingRules: [],
        });
    };

    findMatchingRules() {
        const text = this.state.textCommand;
        return text ? window.findMatched(text, JSON.parse(JSON.stringify(this.props.rules))) : [];
    }

    handleOpenSettingsModal = () => {
        this.setState({
            isSettingsDialogOpen: true,
        });
    };

    handleDialogSelectIdSubmit = (selected, selectedSettingsName) => {
        this.setState({
            localSettings: {
                ...this.state.localSettings,
                [selectedSettingsName]: selected,
            },
        });
    };

    handleDelete = () => {
        this.props.removeRule(this.props.selectedRule.id);
        this.handleCloseConfirmRemoveDialog();
    };

    handleCloseConfirmRemoveDialog = () => {
        this.setState({
            isConfirmRemoveDialogOpen: false,
        });
    };

    handleSearch = event => {
        const matchedRules = this.props.rules.filter(rule =>
            rule.name.toLowerCase().includes(event.target.value.toLowerCase()));
        this.setState({
            filteredRules: matchedRules || [],
            searchedValue: event.target.value,
        });
    };

    toggleSearch = async () => {
        await this.setState({
            isSearchActive: !this.state.isSearchActive,
        });
    };

    createSettingsModal = () => {
        const { t } = I18n;
        const options = ['en', 'de', 'ru'];
        const { classes } = this.props;

        const handleClose = () => {
            this.setState({
                isSettingsDialogOpen: false,
                isSettingsWasNotSaved: true,
            });
        };

        const submitSettings = () => {
            this.props.saveSettings(this.state.localSettings, handleClose);
        };

        const handleChange = (event, name) => {
            let value = event.target.checked !== undefined ? event.target.checked : event.target.value;
            if (name === 'language' && value === 'system') {
                value = '';
            }

            this.setState({
                localSettings: {
                    ...this.state.localSettings,
                    [name]: value,
                },
            });
        };

        return (
            <Dialog
                open={this.state.isSettingsDialogOpen}
                onClose={handleClose}
                fullWidth
                onExited={this.getDefaultSettings}>
                <DialogTitle>
                    <Typography variant="h4" component="span" align="center">
                        {t('Settings')}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <form noValidate autoComplete="off">
                        <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <InputLabel id="demo-simple-select-label">{t('Language')}</InputLabel>
                            <Select
                                classes={{ root: classes.width100 }}
                                onChange={event => handleChange(event, 'language')}
                                value={
                                    !this.state.localSettings.language
                                        ? 'system'
                                        : this.state.localSettings.language
                                }>
                                <MenuItem value="system">{t('System')}</MenuItem>
                                {Children.toArray(
                                    options.map(option => (
                                        <MenuItem value={option}>{t('lang_' + option)}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <TextField
                                label={t('Answer in id')}
                                value={this.state.localSettings.sayitInstance}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'sayitInstance',
                                    })
                                }
                            />
                        </FormControl>
                        <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <TextField
                                label={t(`Processor's id`)}
                                value={this.state.localSettings.processorId}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'processorId',
                                    })
                                }
                            />
                        </FormControl>
                        <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <TextField
                                label={t('Timeout for processor')}
                                helperText={t('ms')}
                                value={this.state.localSettings.processorTimeout}
                                onChange={e => handleChange(e, 'processorTimeout')}
                            />
                        </FormControl>
                        <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <FormControlLabel
                                control={<Checkbox checked={this.state.localSettings.writeEveryAnswer} onChange={e => handleChange(e, 'writeEveryAnswer')} />}
                                label={t('Write to response by every command')}
                            />
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={submitSettings}>Ok</Button>
                    <Button variant="contained" onClick={handleClose}>{I18n.t('Cancel')}</Button>
                </DialogActions>
            </Dialog>
        );
    };

    mainIcons = [
        {
            icon: <AddIcon />,
            handler: () => this.props.handleOpen(),
            tooltip: I18n.t('Create rule'),
        },
        {
            icon: <SettingsIcon />,
            handler: () => this.handleOpenSettingsModal(),
            tooltip: I18n.t('Settings'),
        },
        {
            icon: <CachedIcon />,
            handler: () => console.log('refresh'),
            tooltip: I18n.t('Refresh'),
        },
    ];

    createIcons = iconsData =>
        iconsData.map(({ icon, handler, tooltip }, index) => (
            <CustomTooltip title={tooltip} key={index}>
                <IconButton onClick={handler}>{icon}</IconButton>
            </CustomTooltip>
        ));

    renderSelectIdDialog() {
        return this.state.showDialogSelectId ? (
            <DialogSelectID
                imagePrefix={'../..'}
                socket={this.props.socket}
                title={'Select ID'}
                onClose={() => this.setState({ showDialogSelectId: false })}
                onOk={selected =>
                    this.handleDialogSelectIdSubmit(selected, this.state.selectedSettingsName)
                }
            />
        ) : null;
    }

    renderConfirmDialog() {
        return this.state.isConfirmRemoveDialogOpen ? (
            <Dialog
                open={this.state.isConfirmRemoveDialogOpen}
                onClose={this.handleCloseConfirmRemoveDialog}
                fullWidth>
                <DialogTitle>{I18n.t('Are you sure?')}</DialogTitle>
                <DialogContent>
                    <Typography variant="h5" component="h5">
                        {I18n.t('You want to delete') + ': '}
                        <strong>{this.props.selectedRule.name}</strong>
                    </Typography>
                    <DialogActions>
                        <Button variant="contained" color="primary" autoFocus onClick={this.handleDelete}>{I18n.t('Ok')}</Button>
                        <Button variant="contained" onClick={this.handleCloseConfirmRemoveDialog} color="primary">
                            {I18n.t('Cancel')}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        ) : null;
    }

    renderToast() {
        if (this.state.toast) {
            return <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={true}
                autoHideDuration={4000}
                onClose={() => this.setState({toast: ''})}
            >
                {
                    this.state.toastError ?
                        <Alert elevation={6} variant="filled" onClose={() => this.setState({toast: ''})} severity="error">{this.state.toast}</Alert>
                        :
                        <Alert elevation={6} variant="filled" onClose={() => this.setState({toast: ''})} severity="success">{this.state.toast}</Alert>
                }
            </Snackbar>
        } else {
            return null;
        }
    }

    render() {
        const {
            selectedRule,
            moveRule,
            handleEdit,
            rules,
            selectRule,
            classes,
            isMobile,
            closeDrawer,
        } = this.props;

        const { filteredRules, isSearchActive, searchedValue } = this.state;
        const settingsDialog = this.createSettingsModal();
        const renderedRules = isSearchActive && searchedValue.length ? filteredRules : rules;
        const additionalIcons = [];

        selectedRule &&
            selectedRule.id &&
            additionalIcons.push({
                icon: !isSearchActive && <DeleteIcon />,
                handler: () =>
                    this.setState({isConfirmRemoveDialogOpen: true,}),
                tooltip: I18n.t('Remove rule'),
                key: 'delete',
            });

        rules.length &&
            additionalIcons.push({
                icon: isSearchActive ? <FormatClearIcon /> : <SearchIcon />,
                handler: () => this.toggleSearch(),
                tooltip: I18n.t('Search rule'),
                key: 'search',
            });

        return <Box className={classes.main}>
            <Toolbar position="static" variant="dense" classes={{ root: classes.toolbar }} disableGutters>
                {isSearchActive ?
                    <TextField
                        className={classes.search}
                        onChange={this.handleSearch}
                        value={this.state.searchedValue}
                        InputProps={{
                            endAdornment: this.state.searchedValue ? (
                                <IconButton
                                    onClick={() => this.setState({ searchedValue: '' })}>
                                    <ClearIcon />
                                </IconButton>
                            ) : undefined,
                        }}
                        autoFocus
                    />
                 : <div>{this.createIcons(this.mainIcons)}</div>}
                <div>{this.createIcons(additionalIcons)}</div>
                {isMobile && (
                    <IconButton className={classes.closeBtn} onClick={closeDrawer}>
                        <CloseIcon />
                    </IconButton>
                )}
                {!isSearchActive && !this.state.alive ? <div style={{flexGrow: 1}}/> : null}
                {!isSearchActive && !this.state.alive ? <Tooltip title={I18n.t('Instance is not running')}><WarningIcon className={classes.iconNotAlive}/></Tooltip> : null}

            </Toolbar>

            <DndProvider backend={HTML5Backend}>
                <List className={classes.list}>
                    {renderedRules.map((rule, index) => (
                        <Rule
                            theme={this.props.theme}
                            handleEdit={handleEdit}
                            {...rule}
                            index={index}
                            moveRule={moveRule}
                            key={rule.id}
                            selectRule={selectRule}
                            selectedRule={selectedRule}
                            matchingRules={this.state.matchingRules}
                            unsavedRules={this.props.unsavedRules}
                            removeMatched={this.removeMatched}
                        />
                    ))}
                </List>
            </DndProvider>

            <Toolbar className={classes.test} variant="dense" disableGutters>
                <TextField
                    onChange={this.handleTextCommand}
                    label={I18n.t('Test phrase')}
                    variant="outlined"
                    size="small"
                    color="primary"
                    className={clsx('outlined-basic', classes.root)}
                    onKeyDown={this.handleSubmit}
                    value={this.state.textCommand}
                    inputProps={{style: {padding: '10px 10px'}}}
                    InputProps={{
                        endAdornment: this.state.textCommand ? (
                            <IconButton onClick={() => this.setState({ textCommand: '' })}>
                                <ClearIcon />
                            </IconButton>
                        ) : undefined,
                    }}
                />
                <IconButton
                    variant="outlined"
                    onClick={event => this.handleSubmit(event, true)}>
                    <PlayArrowIcon className={classes.play} />
                </IconButton>
            </Toolbar>

            {settingsDialog}

            {this.renderConfirmDialog()}
            {this.renderSelectIdDialog()}
            {this.renderToast()}
        </Box>;
    }
}

export default withStyles(styles)(Drawer);

Drawer.propTypes = {
    handleOpen: PropTypes.func.isRequired,
    themeType: PropTypes.string,
    rules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
        })
    ),
    instance: PropTypes.number.isRequired,
    moveRule: PropTypes.func.isRequired,
    selectRule: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    selectedRule: PropTypes.shape({
        id: PropTypes.string,
    }),
    removeRule: PropTypes.func,
    handleEdit: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object,
    socket: PropTypes.object.isRequired,
    saveSettings: PropTypes.func.isRequired,
    unsavedRules: PropTypes.object,
    toggleLeftBar: PropTypes.func,
    isMobile: PropTypes.bool.isRequired,
    closeDrawer: PropTypes.func,
};
