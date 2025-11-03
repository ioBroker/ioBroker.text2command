import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    DialogActions,
    Button,
    Select,
    TextField,
    MenuItem,
    FormControl,
    FormGroup,
    DialogTitle,
    InputLabel,
    Dialog,
    DialogContent,
} from '@mui/material';

import {
    Check as CheckIcon,
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
    Add as AddIcon,
} from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

const styles = {
    select: {
        width: '100%',
        marginBottom: 20,
    },
    textField: {
        marginBottom: 8,
    },
};

export default class CreateRuleDialog extends Component {
    constructor(props) {
        super(props);
        const { isEdit, selectedRule } = props;
        this.defaultRule = {
            rule: I18n.t('Select rule'),
            name: I18n.t('New rule'),
            id: '',
        };

        this.state = {
            localRule: isEdit ? selectedRule : this.defaultRule,
        };
    }

    getAvailableOptions = () => {
        const { commands, rules, selectedRule, isEdit } = this.props;

        const uniqueOptions = commands?.filter(
            option => !(option.unique && rules.find(item => item?.rule === option.rule)),
        );

        return selectedRule?.unique && isEdit ? uniqueOptions.concat(selectedRule) : uniqueOptions;
    };

    getUniqueName = ruleName => {
        const existingNames = this.props.rules?.map(rule => rule?.name);

        const matchingNames = existingNames.filter(name => name.slice(0, name.length - 2) === ruleName);
        const isUnique = this.props.commands.find(({ rule, unique }) => rule === ruleName && unique);

        if (matchingNames.length) {
            const name = matchingNames[matchingNames.length - 1];
            let lastChar = name.slice(name.length - 1);

            return name.slice(0, name.length - 1) + ++lastChar;
        }

        return isUnique ? ruleName : `${ruleName} 1`;
    };

    createForm = disabled => {
        const { localRule } = this.state;
        const commands = this.getAvailableOptions();
        const onSubmitHandler = !this.props.isEdit
            ? this.props.handleSubmitOnCreate
            : this.props.isCopy
              ? this.props.handleSubmitOnCopy
              : this.props.handleSubmitOnEdit;

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
            const existingNames = this.props.rules?.map(rule => rule?.name);

            this.setState({
                localRule: {
                    ...localRule,
                    name: event.target.value,
                    isError: existingNames.includes(event.target.value) ? `${I18n.t('Name already exist')}` : '',
                },
            });
        };

        return (
            <FormGroup>
                {!this.props.isCopy ? (
                    <FormControl
                        fullWidth
                        variant="standard"
                    >
                        <InputLabel
                            shrink
                            id="rule"
                        >
                            {I18n.t('Rule')}
                        </InputLabel>
                        <Select
                            variant="standard"
                            onChange={handleSelectChange}
                            value={localRule.rule}
                            labelId="rule"
                            style={styles.select}
                        >
                            {commands?.map(option => (
                                <MenuItem
                                    key={option.rule}
                                    value={option.rule}
                                >
                                    {option.rule}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : null}
                <TextField
                    variant="standard"
                    fullWidth
                    autoFocus
                    id="standard-basic"
                    label={this.state.localRule.isError || I18n.t('Name')}
                    value={localRule.name}
                    onKeyDown={e => {
                        if (e.keyCode === 13 && !disabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            onSubmitHandler(this.state.localRule, this.state.localRule.isError);
                        }
                    }}
                    onChange={handleInputChange}
                    error={!!this.state.localRule.isError}
                    style={styles.textField}
                />
            </FormGroup>
        );
    };

    setDialogContent = () => {
        const { handleClose, handleSubmitOnCreate, handleSubmitOnEdit, isEdit, isCopy, handleSubmitOnCopy } =
            this.props;
        const onSubmitHandler = !isEdit ? handleSubmitOnCreate : isCopy ? handleSubmitOnCopy : handleSubmitOnEdit;
        const disabled =
            !this.state.localRule.name ||
            !this.state.localRule.rule ||
            (this.state.localRule.name === this.defaultRule.name &&
                this.state.localRule.rule === this.defaultRule.rule) ||
            (this.state.localRule.name === this.props.selectedRule?.name &&
                this.state.localRule.rule === this.props.selectedRule?.rule);

        return (
            <DialogContent>
                {this.createForm(disabled, onSubmitHandler)}
                <DialogActions>
                    {isEdit || isCopy ? (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => onSubmitHandler(this.state.localRule, this.state.localRule.isError, true)}
                            startIcon={<CheckIcon />}
                            disabled={disabled}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {I18n.t('Apply and save')}
                        </Button>
                    ) : null}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSubmitHandler(this.state.localRule, this.state.localRule.isError)}
                        startIcon={!isEdit ? <AddIcon /> : isCopy ? <ContentCopyIcon /> : <CheckIcon />}
                        disabled={disabled}
                    >
                        {!isEdit ? I18n.t('Create') : isCopy ? I18n.t('Copy') : I18n.t('Apply')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        onClick={handleClose}
                        startIcon={<CloseIcon />}
                    >
                        {I18n.t('Cancel')}
                    </Button>
                </DialogActions>
            </DialogContent>
        );
    };

    render() {
        return (
            <Dialog
                open={this.props.isOpen}
                onClose={this.props.handleClose}
                fullWidth
            >
                <DialogTitle>
                    {I18n.t(!this.props.isEdit ? 'Create new rule' : this.props.isCopy ? 'Clone rule' : 'Edit rule')}
                </DialogTitle>
                {this.setDialogContent()}
            </Dialog>
        );
    }
}

CreateRuleDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmitOnCreate: PropTypes.func.isRequired,
    handleSubmitOnEdit: PropTypes.func.isRequired,
    handleSubmitOnCopy: PropTypes.func.isRequired,
    isEdit: PropTypes.bool.isRequired,
    commands: PropTypes.arrayOf(
        PropTypes.shape({
            rule: PropTypes.string.isRequired,
            unique: PropTypes.bool.isRequired,
        }).isRequired,
    ),
    isOpen: PropTypes.bool.isRequired,
    selectedRule: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        rule: PropTypes.string.isRequired,
        unique: PropTypes.bool,
    }),
    rules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            rule: PropTypes.string.isRequired,
            unique: PropTypes.bool,
        }),
    ).isRequired,
};
