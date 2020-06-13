import React, { Component } from "react";
import { v4 as uuid } from "uuid";
import SplitterLayout from "react-splitter-layout";
import PropTypes from "prop-types";

import LeftBar from "./LeftBar";
import RightBar from "./RightBar";
import { commands } from "@admin/langModel";
import Modal from "./Modal";
import I18n from "@iobroker/adapter-react/i18n";

import "react-splitter-layout/lib/index.css";

export default class Layout extends Component {
	state = {
		lang: I18n.getLanguage(),
		currentRules: [],
		isOpen: false,
		isEdit: false,
		selectedRule: ""
	};
	componentDidMount() {
		this.setState({
			commands: this.getSelectedLanguageCommands()
		});
	}

	getSelectedLanguageCommands = () => {
		const { lang } = this.state;

		const setAckIfDefined = (obj, command) => {
			if (command.ack?.name) {
				obj.ack = {
					...obj.ack,
					name: command.ack.name[lang]
				};
			}
			if (command.ack?.default) {
				obj.ack = {
					...obj.ack,
					default: command.ack.default[lang]
				};
			}
		};

		const setArgsIfDefined = (obj, command) => {
			if (command.args && command.args[0]?.name) {
				obj.args = [
					{
						...command.args[0],
						name: command.args[0].name[lang]
					}
				];
			}
			if (command.args && command.args[1]?.name) {
				obj.args = [
					...obj.args,
					{
						...command.args[1],
						name: command.args[1].name[lang]
					}
				];
			}
		};

		return [
			{ rule: I18n.t("Select rule"), unique: false },
			...Object.values(commands).map(command => {
				const { name, ...rest } = command;
				const obj = {
					...rest,
					rule: command?.name[lang],
					unique: command.unique,
					words: command.words && command.words[lang]
				};
				setArgsIfDefined(obj, command);
				setAckIfDefined(obj, command);
				return obj;
			})
		];
	};

	moveRule = (dragIndex, hoverIndex) => {
		const { currentRules } = this.state;
		const sourceRule = currentRules.find((_, index) => index === hoverIndex);
		const sortRules = currentRules.filter((_, index) => index !== hoverIndex);
		sortRules.splice(dragIndex, 0, sourceRule);
		this.setState({ currentRules: sortRules });
	};

	handleOpen = () => {
		this.setState({
			isOpen: true
		});
	};
	handleClose = () => {
		this.setState({ isOpen: false });
	};

	handleSubmit = selectedRule => {
		const id = uuid();

		const addNewRule = () =>
			this.setState({
				currentRules: [
					...this.state.currentRules,
					{
						...selectedRule,
						id
					}
				]
			});
		const editSelectedRule = () =>
			this.setState({
				currentRules: this.state.currentRules.map(item =>
					item.id === selectedRule.id ? selectedRule : item
				)
			});

		this.state.isEdit ? editSelectedRule() : addNewRule();
		this.handleClose();
	};

	selectRule = id => {
		const { selectedRule, currentRules, commands } = this.state;
		if (selectedRule.id === id) return;
		const shortDataRule = currentRules.find(item => item.id === id);
		const rule = !shortDataRule.words
			? commands.find(command => command.rule === shortDataRule.rule)
			: {};
		this.setState({
			selectedRule: { ...rule, ...shortDataRule }
		});
	};

	handleEdit = id => {
		this.setState({
			isEdit: true
		});
		this.selectRule(id);
		this.handleOpen();
	};

	finishEdit = rule => {
		this.setState({
			isEdit: false,
			selectedRule: rule
		});
	};

	render() {
		console.log(this.state);
		const { commands, isEdit, isOpen, currentRules, selectedRule } = this.state;
		return (
			<>
				<SplitterLayout
					percentage
					// primaryMinSize={15}
					secondaryInitialSize={75}
					secondaryMinSize={65}
				>
					<LeftBar
						handleOpen={this.handleOpen}
						rules={currentRules}
						moveRule={this.moveRule}
						handleEdit={this.handleEdit}
						selectRule={this.selectRule}
						selectedRule={selectedRule}
					/>
					<RightBar selectedRule={selectedRule} socket={this.props.socket} />
				</SplitterLayout>
				<Modal
					commands={commands}
					isEdit={isEdit}
					handleSubmit={this.handleSubmit}
					handleClose={this.handleClose}
					isOpen={isOpen}
					currentRules={currentRules}
					selectedRule={selectedRule}
					finishEdit={this.finishEdit}
				/>
			</>
		);
	}
}

Layout.propTypes = {
	socket: PropTypes.object.isRequired
};
