import React, { Component } from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import I18n from "@iobroker/adapter-react/i18n";
import InputLabel from "@material-ui/core/InputLabel";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormGroup from "@material-ui/core/FormGroup";

import {
	DialogActions,
	Button,
	Select,
	TextField,
	MenuItem,
} from "@material-ui/core";

export default class Modal extends Component {
	defaultRule = {
		rule: I18n.t("Select rule"),
		name: I18n.t("New rule"),
		id: "",
	};
	state = {
		localRule: this.defaultRule,
	};
	setLRuleOnMount = () => {
		const { isEdit, selectedRule } = this.props;
		if (isEdit) {
			this.setState({
				localRule: selectedRule,
			});
		}
	};

	cleanState = () => {
		if (this.props.isEdit) {
			this.props.finishEdit();
		}
		this.setState({
			localRule: this.defaultRule,
		});
	};

	getAvaliableOptions = () => {
		const { commands, currentRules, selectedRule } = this.props;
		return commands
			?.filter(
				option =>
					!(
						option.unique &&
						currentRules.find(item => item?.rule === option.rule)
					)
			)
			.concat(selectedRule);
	};

	createForm = () => {
		const { localRule } = this.state;
		const commands = this.getAvaliableOptions();

		const handleSelectChange = event =>
			this.setState({
				localRule: {
					...localRule,
					rule: event.target.value,
					name: event.target.value + " 1",
				},
			});

		const handleInputChange = event =>
			this.setState({
				localRule: {
					...this.state.localRule,
					name: event.target.value,
				},
			});

		return (
			<FormGroup>
				<TextField
					id="standard-basic"
					label={I18n.t("Name")}
					value={localRule.name}
					onChange={handleInputChange}
				></TextField>
				<div className="select">
					<InputLabel shrink id="rule">
						{I18n.t("Rule")}
					</InputLabel>
					<Select
						onChange={handleSelectChange}
						value={localRule.rule}
						labelId={"rule"}
					>
						{commands?.map((option, index) => (
							<MenuItem key={index} value={option.rule}>
								{option.rule}
							</MenuItem>
						))}
					</Select>
				</div>
			</FormGroup>
		);
	};

	setDialogContent = () => {
		const { commands, handleClose } = this.props;

		return (
			<DialogContent>
				{this.createForm()}
				<DialogActions>
					<Button
						onClick={this.props.handleSubmit.bind(this, this.state.localRule)}
					>
						Ok
					</Button>
					<Button onClick={handleClose}>Cancel</Button>
				</DialogActions>
			</DialogContent>
		);
	};
	render() {
		console.log(this.state);
		return (
			<Dialog
				open={this.props.isOpen}
				onClose={this.props.handleClose}
				onExited={this.cleanState}
				onEnter={this.setLRuleOnMount}
			>
				<DialogTitle>
					{I18n.t(!this.props.isEdit ? "Create new rule" : "Edit rule")}
				</DialogTitle>
				{this.setDialogContent()}
			</Dialog>
		);
	}
}

Modal.propTypes = {
	handleClose: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	isEdit: PropTypes.bool.isRequired,
	commands: PropTypes.arrayOf(PropTypes.object.isRequired),
	isOpen: PropTypes.bool.isRequired,
	currentRules: PropTypes.object.isRequired,
	finishEdit: PropTypes.func.isRequired,
};
