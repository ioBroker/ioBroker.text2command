import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

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
import CheckIcon from "@material-ui/icons/Check";
import {Grid} from "@material-ui/core";

function mobileCheck() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true; }(navigator.userAgent || navigator.vendor || window.opera));
    return check;
}

function isTouchDevice() {
    if (!mobileCheck()) {
        return false;
    }
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

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
        height: 'calc(100% - 48px - 48px - 8px)',
        overflowX: 'hidden',
        overflowY: 'auto',
        paddingTop: 0.,
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
        float: 'right',
        marginRight: theme.spacing(1)
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
    selectIdText: {
        width: 'calc(100% - 50px)'
    },
    selectIdButton: {
        minWidth: 40,
    }
});

const tooltipStyles = theme => ({
    tooltip: {
        fontSize: 14,
    },
});

const CustomTooltip = withStyles(tooltipStyles)(Tooltip);

class Drawer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            textCommand: '',
            matchingRules: [],
            isSettingsDialogOpen: false,
            isConfirmRemoveDialogOpen: false,
            isSearchActive: false,
            filteredRules: [],
            searchedValue: '',
            localSettings: {
                language: this.props.settings.language || '',
                processorId:  this.props.settings.processorId || '',
                processorTimeout:  this.props.settings.processorTimeout || 1000,
                sayitInstance:  this.props.settings.sayitInstance || '',
            },
            toast: null,
            alive: false,
        };
    }

    componentDidMount() {
        this.props.socket.subscribeState(`text2command.${this.props.instance}.response`, this.onResponse);
        this.props.socket.subscribeState(`system.adapter.text2command.${this.props.instance}.alive`, this.onAlive);

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
        this.props.socket.unsubscribeState(`text2command.${this.props.instance}.response`, this.onResponse);
        this.props.socket.unsubscribeState(`system.adapter.text2command.${this.props.instance}.alive`, this.onAlive);
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
            this.props.socket.setState(`text2command.${this.props.instance}.text`, this.state.textCommand)
                .catch(err => console.error(err));

            if (!this.state.alive) {
                this.setState({toast: I18n.t('Instance is not running'), toastError: true});
            }
        }
    };

    removeMatched = () => {
        this.setState({matchingRules: []});
    };

    findMatchingRules() {
        const text = this.state.textCommand;
        return text ? window.findMatched(text, JSON.parse(JSON.stringify(this.props.rules))) : [];
    }

    handleOpenSettingsModal = () => {
        this.setState({isSettingsDialogOpen: true});
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
        this.setState({isConfirmRemoveDialogOpen: false});
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
        await this.setState({isSearchActive: !this.state.isSearchActive});
    };

    createSettingsModal = () => {
        if (!this.state.isSettingsDialogOpen) {
            return null;
        }

        const { t } = I18n;
        const options = ['en', 'de', 'ru'];
        const { classes } = this.props;

        const handleClose = () => {
            this.setState({
                isSettingsDialogOpen: false,
                isSettingsWasNotSaved: true,
            });
        };

        const submitSettings = () => this.props.saveSettings(this.state.localSettings, handleClose);

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

        return <Dialog
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
                    <Grid container direction="column">
                        <Grid item>
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
                                    options.map(option =>
                                        <MenuItem value={option}>{t('lang_' + option)}</MenuItem>)
                                )}
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: clsx(classes.settingsItem, classes.selectIdText) }}>
                                <TextField
                                    label={t('Answer in id')}
                                    value={this.state.localSettings.sayitInstance}
                                    onChange={event => handleChange(event, 'sayitInstance')}
                                />
                            </FormControl>
                            <Button
                                variant="outlined"
                                className={classes.selectIdButton}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'sayitInstance',
                                        selectedId: this.state.localSettings.sayitInstance || '',
                                    })}
                            >...</Button>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: clsx(classes.settingsItem, classes.selectIdText) }}>
                                <TextField
                                    label={t(`Processor's id`)}
                                    value={this.state.localSettings.processorId}
                                    onChange={event => handleChange(event, 'processorId')}
                                />
                            </FormControl>
                            <Button
                                variant="outlined"
                                className={classes.selectIdButton}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'processorId',
                                        selectedId: this.state.localSettings.processorId || '',
                                    })}
                            >...</Button>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                            <TextField
                                label={t('Timeout for processor')}
                                helperText={t('ms')}
                                value={this.state.localSettings.processorTimeout}
                                onChange={e => handleChange(e, 'processorTimeout')}
                            />
                        </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                                <FormControlLabel
                                    control={<Checkbox checked={this.state.localSettings.writeEveryAnswer} onChange={e => handleChange(e, 'writeEveryAnswer')} />}
                                    label={t('Write to response by every command')}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }}>
                                <FormControlLabel
                                    control={<Checkbox checked={this.state.localSettings.noNegativeMessage} onChange={e => handleChange(e, 'noNegativeMessage')} />}
                                    label={t('Do not answer "I don\'t understand" if no rules found')}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={submitSettings} startIcon={<CheckIcon/>}>{I18n.t('Ok')}</Button>
                <Button variant="contained" onClick={handleClose}startIcon={<CloseIcon/>}>{I18n.t('Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    };

    mainIcons = [
        {
            icon: <AddIcon />,
            handler: () => this.props.handleOpen(true),
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
        iconsData.map(({ icon, handler, tooltip }, index) => <CustomTooltip title={tooltip} key={index}>
            <IconButton onClick={handler}>{icon}</IconButton>
        </CustomTooltip>);

    renderSelectIdDialog() {
        return this.state.showDialogSelectId ? (
            <DialogSelectID
                imagePrefix={'../..'}
                socket={this.props.socket}
                title={'Select ID'}
                selected={this.state.selectedId}
                onClose={() => this.setState({ showDialogSelectId: false })}
                onOk={selected => this.handleDialogSelectIdSubmit(selected, this.state.selectedSettingsName)}
            />
        ) : null;
    }

    renderConfirmDialog() {
        return this.state.isConfirmRemoveDialogOpen ?
            <Dialog
                open={this.state.isConfirmRemoveDialogOpen}
                onClose={this.handleCloseConfirmRemoveDialog}
                fullWidth>
                <DialogTitle>{I18n.t('Are you sure?')}</DialogTitle>
                <DialogContent>
                    <Typography component="p">
                        {I18n.t('You want to delete: %s', this.props.selectedRule.name)}
                    </Typography>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            autoFocus
                            onClick={this.handleDelete}
                            startIcon={<DeleteIcon/>}
                        >{I18n.t('Delete')}</Button>
                        <Button
                            variant="contained"
                            onClick={this.handleCloseConfirmRemoveDialog}
                                startIcon={<CloseIcon/>}
                                >
                            {I18n.t('Cancel')}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
         : null;
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
            handleCopy,
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

            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                <List className={classes.list}>
                    {renderedRules.map((rule, index) => (
                        <Rule
                            theme={this.props.theme}
                            handleEdit={handleEdit}
                            handleCopy={handleCopy}
                            unique={rule.unique}
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
    selectedRule: PropTypes.shape({id: PropTypes.string}),
    removeRule: PropTypes.func,
    handleEdit: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object,
    socket: PropTypes.object.isRequired,
    saveSettings: PropTypes.func.isRequired,
    unsavedRules: PropTypes.object,
    toggleLeftBar: PropTypes.func,
    isMobile: PropTypes.bool.isRequired,
    closeDrawer: PropTypes.func,
};
