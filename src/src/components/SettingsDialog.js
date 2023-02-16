import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import DialogActions from '@mui/material/DialogActions';
import CheckIcon from '@mui/icons-material/Check';

import { I18n, Utils, SelectID as DialogSelectID } from '@iobroker/adapter-react-v5';

const styles = theme => ({
    settingsItem: {
        marginBottom: theme.spacing(3),
    },
    width100: {
        width: '100%',
    },
    selectIdText: {
        width: 'calc(100% - 50px)',
    },
    selectIdButton: {
        minWidth: 40,
    },
});

class SettingsDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: JSON.parse(JSON.stringify(props.settings)),
            originalSettings: JSON.stringify(props.settings),
            showDialogSelectId: false,
            selectedSettingsName: '',
            selectedId: '',
        };
    }

    handleChange = (value, name) => {
        if (name === 'language' && value === 'system') {
            value = '';
        }

        this.setState({
            settings: {
                ...this.state.settings,
                [name]: value,
            },
        });
    };

    renderSelectIdDialog() {
        return this.state.showDialogSelectId ? (
            <DialogSelectID
                imagePrefix="../.."
                socket={this.props.socket}
                title="Select ID"
                selected={this.state.selectedId}
                onClose={() => this.setState({ showDialogSelectId: false })}
                onOk={selected => this.handleChange(selected, this.state.selectedSettingsName)}
            />
        ) : null;
    }

    render() {
        const classes = this.props.classes;
        const options = ['en', 'de', 'ru'];

        return <Dialog
            open={!0}
            onClose={() => this.props.onClose()}
            fullWidth
        >
            {this.renderSelectIdDialog()}
            <DialogTitle>
                <Typography variant="h4" component="span" align="center">
                    {I18n.t('Settings')}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <form noValidate autoComplete="off">
                    <Grid container direction="column">
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }} variant="standard">
                                <InputLabel id="demo-simple-select-label">{I18n.t('Language')}</InputLabel>
                                <Select
                                    variant="standard"
                                    classes={{ root: classes.width100 }}
                                    onChange={e => this.handleChange(e.target.value, 'language')}
                                    value={
                                        !this.state.settings.language
                                            ? 'system'
                                            : this.state.settings.language
                                    }
                                >
                                    <MenuItem value="system">{I18n.t('System')}</MenuItem>
                                    {options.map(option => <MenuItem key={option} value={option}>{I18n.t(`lang_${option}`)}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: Utils.clsx(classes.settingsItem, classes.selectIdText) }} variant="standard">
                                <TextField
                                    variant="standard"
                                    label={I18n.t('Answer in id')}
                                    value={this.state.settings.sayitInstance || ''}
                                    onChange={e => this.handleChange(e.target.value, 'sayitInstance')}
                                    InputProps={{
                                        endAdornment: this.state.settings.sayitInstance ?
                                            <IconButton onClick={() => this.handleChange('', 'sayitInstance')}>
                                                <CloseIcon />
                                            </IconButton> : undefined,
                                    }}
                                />
                            </FormControl>
                            <Button
                                color="grey"
                                variant="outlined"
                                className={classes.selectIdButton}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'sayitInstance',
                                        selectedId: this.state.settings.sayitInstance || '',
                                    })}
                            >
                                ...
                            </Button>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: Utils.clsx(classes.settingsItem, classes.selectIdText) }} variant="standard">
                                <TextField
                                    variant="standard"
                                    label={I18n.t('Processor\'s id')}
                                    value={this.state.settings.processorId}
                                    onChange={e => this.handleChange(e.target.value, 'processorId')}
                                    InputProps={{
                                        endAdornment: this.state.settings.processorId ?
                                            <IconButton onClick={() => this.handleChange('', 'processorId')}>
                                                <CloseIcon />
                                            </IconButton> : undefined,
                                    }}
                                />
                            </FormControl>
                            <Button
                                color="grey"
                                variant="outlined"
                                className={classes.selectIdButton}
                                onClick={() =>
                                    this.setState({
                                        showDialogSelectId: true,
                                        selectedSettingsName: 'processorId',
                                        selectedId: this.state.settings.processorId || '',
                                    })}
                            >
                                ...
                            </Button>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }} variant="standard">
                                <TextField
                                    variant="standard"
                                    label={I18n.t('Timeout for processor')}
                                    helperText={I18n.t('ms')}
                                    type="number"
                                    min={50}
                                    max={15000}
                                    value={this.state.settings.processorTimeout}
                                    onChange={e => this.handleChange(e.target.value, 'processorTimeout')}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }} variant="standard">
                                <FormControlLabel
                                    control={<Checkbox checked={this.state.settings.writeEveryAnswer} onChange={e => this.handleChange(e.target.checked, 'writeEveryAnswer')} />}
                                    label={I18n.t('Write to response by every command')}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth classes={{ root: classes.settingsItem }} variant="standard">
                                <FormControlLabel
                                    control={<Checkbox checked={this.state.settings.noNegativeMessage} onChange={e => this.handleChange(e.target.checked, 'noNegativeMessage')} />}
                                    label={I18n.t('Do not answer "I don\'t understand" if no rules found')}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.props.onClose(this.state.settings)}
                    startIcon={<CheckIcon />}
                    disabled={JSON.stringify(this.state.settings) === this.state.originalSettings}
                >
                    {I18n.t('Ok')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => this.props.onClose()}
                    startIcon={<CloseIcon />}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

SettingsDialog.propTypes = {
    socket: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default withStyles(styles)(SettingsDialog);
