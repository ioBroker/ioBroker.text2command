import React, { Component, useEffect } from "react";
import I18n from "@iobroker/adapter-react/i18n";
import { TextField, Switch, Typography } from "@material-ui/core";
import DialogSelectID from "@iobroker/adapter-react/Dialogs/SelectID";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import PropTypes from "prop-types";
import { v4 as uuid } from "uuid";

export default class RightBar extends Component {
	defaultState = {
		words: "Выберите правило",
		name: "Выберите правило",
		interupt: false,
		editable: false,
		args: [
			{
				name: "Параметр 1",
			},
			{
				name: "Параметр 2",
			},
		],
		ack: {
			name: "",
			default: `${I18n.t("Confirmation text")}`,
		},
	};

	state = {
		localRule: this.defaultState,
		showDialog: false,
	};

	createInput = ({
		value,
		label,
		onChange,
		type,
		onClick,
		disabled = this.state.localRule === this.defaultState,
		keywords,
	}) => {
		if (!value && !label && !keywords) return;
		return type !== "checkbox" ? (
			<TextField
				label={label}
				id="outlined-basic"
				variant="outlined"
				size="small"
				disabled={disabled}
				value={value}
				onClick={onClick}
				onChange={event =>
					this.setState({ localRule: { words: event.target.value } })
				}
			/>
		) : (
			<FormControl>
				<FormControlLabel
					value={value}
					label={label}
					labelPlacement={"start"}
					control={<Switch onClick={onChange} />}
				/>
			</FormControl>
		);
	};

	componentDidUpdate(prevProps, prevState) {
		if (
			prevProps.selectedRule?.name !== this.props.selectedRule?.name ||
			prevState.localRule?.name !== this.state.localRule?.name
		) {
			this.setState({
				newOptionsData: this.createOptionsData(),
				localRule: {
					...this.props.selectedRule,
					interupt: true,
				},
			});
		}
	}

	createOptionsData = (state = this.state) => {
		const {
			localRule: { words, interupt, args, ack, editable },
		} = state;

		console.log(this.state);

		const { t } = I18n;
		const createInput = this.createInput;

		const isKeyWordsDisabled = () => {
			if (editable === "undefined") return false;
			else if (editable === false) return true;
		};

		const handleTextInputChange = (event, name) => {
			this.setState({
				localRule: {
					...this.state.localRule,
					[name]: event.target.value,
				},
			});
		};

		return [
			{
				title: `${t("Keywords")}:`,
				item: createInput({
					value: this.state.localRule?.words,
					onChange: event =>
						this.setState({
							localRule: {
								["words"]: event.target.value,
							},
						}),
					keywords: true,
					disabled: isKeyWordsDisabled(),
				}),
				id: 1,
			},
			{
				title: `${t("Interupt")}:`,
				item: (
					<Switch
						size="medium"
						color={"primary"}
						checked={interupt}
						onClick={this.handleSwitchChange}
					/>
				),
				id: 2,
			},
			{
				title: `${t("Param")}:`,
				item: createInput({
					value: args && args[0]?.default,
					label: args && args[0]?.name,
					type: args && args[0]?.type,
					onClick: () => this.setState({ showDialog: true }),
				}),
				id: 3,
			},
			{
				title: `${t("Param")}:`,
				item: createInput({
					value: args && args[1]?.default,
					label: args && args[1]?.name,
				}),
				id: 4,
			},
			{
				title: `${t("Confirmation text")}:`,
				item: createInput({
					value: ack && ack.default,
					label: ack && ack.name,
					type: ack && ack.type,
				}),
				id: 5,
			},
		];
	};

	handleSwitchChange = () => {
		this.setState({
			localRule: {
				...this.state.localRule,
				interupt: !this.state.localRule.interupt,
			},
		});
	};

	render() {
		const {
			localRule: { name },
			newOptionsData,
		} = this.state;

		return (
			<div className="right-bar">
				<div className="right-bar__container">
					<Typography variant="h4" align="center" gutterBottom={true}>
						{name || "Выберите правило"}
					</Typography>
					{this.createOptionsData().map(({ title, item, id }) => {
						if (!item) return null;
						return (
							<div className="custom-card" key={id}>
								<Typography variant="h5" component="h2" align="left">
									{title}
								</Typography>
								{item}
							</div>
						);
					})}
				</div>

				{this.state.showDialog && (
					<DialogSelectID
						connection={this.props.socket}
						title={"Select ID"}
						onClose={() => this.setState({ showDialog: false })}
						onOk={() => this.setState({ showDialog: false })}
					/>
				)}
			</div>
		);
	}
}

RightBar.propTypes = {
	selectedRule: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	socket: PropTypes.object.isRequired,
};
