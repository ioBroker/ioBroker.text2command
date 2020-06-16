import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import I18n from '@iobroker/adapter-react/i18n';
import InputLabel from '@material-ui/core/InputLabel';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import { DialogActions, Button, Select, TextField, MenuItem, withStyles } from '@material-ui/core';

const styles = theme => ({
    select: {
        width: '50%',
        marginBottom: theme.spacing(2.5),
    },
    TextField: {
        marginBottom: theme.spacing(1),
    },
});

class Modal extends Component {
    defaultRule = {
        rule: I18n.t('Select rule'),
        name: I18n.t('New rule'),
        id: '',
    };

    state = {
        localRule: this.defaultRule,
    };

    existingNames = [];

    componentDidUpdate(prevProps) {
        if (prevProps.currentRules !== this.props.currentRules) {
            this.existingNames = this.props.currentRules.map(rule => rule.name);
        }
    }

    setRuleOnMount = () => {
        const { isEdit, selectedRule } = this.props;
        if (isEdit) {
            this.setState({
                localRule: selectedRule,
            });
        }
    };

    cleanState = () => {
        if (this.props.isEdit) {
            this.props.finishEdit(this.state.localRule);
        }
        this.setState({
            localRule: this.defaultRule,
        });
    };

    getAvaliableOptions = () => {
        const { commands, currentRules, selectedRule } = this.props;

        const uniqueOptions = commands?.filter(
            option => !(option.unique && currentRules.find(item => item?.rule === option.rule))
        );

        return selectedRule.unique ? uniqueOptions.concat(selectedRule) : uniqueOptions;
    };

    getUniqueName = ruleName => {
        const matchingNames = this.existingNames.filter(
            name => name.slice(0, name.length - 2) === ruleName
        );
        const isUnique = this.props.commands.find(
            ({ rule, unique }) => rule === ruleName && unique
        );

        if (matchingNames.length) {
            let name = matchingNames[matchingNames.length - 1];
            let lastChar = name.slice(name.length - 1);

            return name.slice(0, name.length - 1) + ++lastChar;
        }

        return isUnique ? ruleName : `${ruleName} 1`;
    };

    createForm = () => {
        const { localRule } = this.state;
        const { classes } = this.props;
        const commands = this.getAvaliableOptions();

        const handleSelectChange = event =>
            this.setState({
                localRule: {
                    ...localRule,
                    rule: event.target.value,
                    name: this.getUniqueName(event.target.value),
                    isError: '',
                },
            });

        const handleInputChange = event => {
            this.setState({
                localRule: {
                    ...localRule,
                    name: event.target.value,
                    isError: this.existingNames.includes(event.target.value)
                        ? `${I18n.t('Name already exist')}`
                        : '',
                },
            });
        };

        return (
            <FormGroup>
                <FormControl>
                    <InputLabel shrink id="rule">
                        {I18n.t('Rule')}
                    </InputLabel>
                    <Select
                        onChange={handleSelectChange}
                        value={localRule.rule}
                        labelId={'rule'}
                        className={classes.select}>
                        {commands?.map(option => (
                            <MenuItem key={option.rule} value={option.rule}>
                                {option.rule}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    id="standard-basic"
                    label={this.state.localRule.isError || I18n.t('Name')}
                    value={localRule.name}
                    onChange={handleInputChange}
                    error={!!this.state.localRule.isError}
                    className={classes.TextField}></TextField>
            </FormGroup>
        );
    };

    setDialogContent = () => {
        const { handleClose, handleSubmit } = this.props;

        return (
            <DialogContent>
                {this.createForm()}
                <DialogActions>
                    <Button
                        onClick={handleSubmit.bind(
                            this,
                            this.state.localRule,
                            this.state.localRule.isError
                        )}>
                        Ok
                    </Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </DialogContent>
        );
    };
    render() {
        return (
            <Dialog
                open={this.props.isOpen}
                onClose={this.props.handleClose}
                onExited={this.cleanState}
                onEnter={this.setRuleOnMount}
                fullWidth>
                <DialogTitle>
                    {I18n.t(!this.props.isEdit ? 'Create new rule' : 'Edit rule')}
                </DialogTitle>
                {this.setDialogContent()}
            </Dialog>
        );
    }
}

export default withStyles(styles)(Modal);

Modal.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool.isRequired,
    commands: PropTypes.arrayOf(
        PropTypes.shape({
            rule: PropTypes.string.isRequired,
            unique: PropTypes.bool.isRequired,
        }).isRequired
    ),
    isOpen: PropTypes.bool.isRequired,
    currentRules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            rule: PropTypes.string.isRequired,
            unique: PropTypes.bool,
        })
    ).isRequired,
    finishEdit: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};
