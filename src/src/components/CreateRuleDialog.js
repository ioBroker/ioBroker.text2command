import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import { DialogActions, Button, Select, TextField, MenuItem, withStyles } from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

const styles = theme => ({
    select: {
        width: '100%',
        marginBottom: theme.spacing(2.5),
    },
    TextField: {
        marginBottom: theme.spacing(1),
    },
});

class CreateRuleDialog extends Component {
    defaultRule = {
        rule: I18n.t('Select rule'),
        name: I18n.t('New rule'),
        id: '',
    };

    state = {
        localRule: this.defaultRule,
        isDisabled: true,
    };

    componentWillUnmount() {
        this.cleanState();
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

    getAvailableOptions = () => {
        const { commands, currentRules, selectedRule, isEdit } = this.props;

        const uniqueOptions = commands?.filter(
            option => !(option.unique && currentRules.find(item => item?.rule === option.rule))
        );

        return selectedRule?.unique && isEdit ? uniqueOptions.concat(selectedRule) : uniqueOptions;
    };

    getUniqueName = ruleName => {
        const existingNames = this.props.currentRules?.map(rule => rule?.name);

        const matchingNames = existingNames.filter(
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
        const commands = this.getAvailableOptions();

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
            const existingNames = this.props.currentRules?.map(rule => rule?.name);

            this.setState({
                localRule: {
                    ...localRule,
                    name: event.target.value,
                    isError: existingNames.includes(event.target.value)
                        ? `${I18n.t('Name already exist')}`
                        : '',
                },
            });
        };

        return (
            <FormGroup>
                <FormControl fullWidth>
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
                    fullWidth
                    id="standard-basic"
                    label={this.state.localRule.isError || I18n.t('Name')}
                    value={localRule.name}
                    onChange={handleInputChange}
                    error={!!this.state.localRule.isError}
                    className={classes.TextField}/>
            </FormGroup>
        );
    };

    setDialogContent = () => {
        const { handleClose, handleSubmitOnCreate, handleSubmitOnEdit, isEdit } = this.props;
        const onSubmitHandler = !isEdit ? handleSubmitOnCreate : handleSubmitOnEdit;
        return (
            <DialogContent>
                {this.createForm()}
                <DialogActions>
                    <Button
                        onClick={onSubmitHandler.bind(
                            this,
                            this.state.localRule,
                            this.state.localRule.isError
                        )}
                        disabled={!this.state.localRule.name || !this.state.localRule.rule || (this.state.localRule.name === this.defaultRule.name && this.state.localRule.rule === this.defaultRule.rule) ||
                        (this.state.localRule.name === this.props.selectedRule?.name && this.state.localRule.rule === this.props.selectedRule?.rule)}>
                        { I18n.t('Ok') }
                    </Button>
                    <Button onClick={handleClose}>{I18n.t('Cancel')}</Button>
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

export default withStyles(styles)(CreateRuleDialog);

CreateRuleDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmitOnCreate: PropTypes.func.isRequired,
    handleSubmitOnEdit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool.isRequired,
    commands: PropTypes.arrayOf(
        PropTypes.shape({
            rule: PropTypes.string.isRequired,
            unique: PropTypes.bool.isRequired,
        }).isRequired
    ),
    isOpen: PropTypes.bool.isRequired,
    selectedRule: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rule: PropTypes.string.isRequired,
        unique: PropTypes.bool,
    }),
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
