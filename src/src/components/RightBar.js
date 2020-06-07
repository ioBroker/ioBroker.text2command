import React, { Component } from "react";
import I18n from "@iobroker/adapter-react/i18n";
import { TextField, Switch, Typography } from "@material-ui/core";
import PropTypes from "prop-types";

export default class RightBar extends Component {
	defaultState = {
		words: "Выберите правило",
		name: "Выберите правило",
		invisible: false,
	};
	static getDerivedStateFromProps = (props, state) => {
		if (!props.selectedRule) return null;
		else if (props.selectedRule.name !== state.localRule.name) {
			return {
				localRule: props.selectedRule,
			};
		}
		return null;
	};
	state = {
		localRule: this.defaultState,
	};

	handleSwitchChange = () => {
		this.setState({
			localRule: {
				...this.state.localRule,
				invisible: !this.state.localRule.invisible,
			},
		});
	};

	createInput = (
		label,
		value,
		disabled = this.state.localRule === this.defaultState
	) => {
		return (
			<TextField
				label={label}
				id="outlined-basic"
				variant="outlined"
				size="small"
				disabled={disabled}
				value={value}
			/>
		);
	};

	createOptionsData = () => {
		const {
			localRule: { words, invisible },
		} = this.state;

		const { t } = I18n;
		const createInput = this.createInput;

		return [
			{
				title: `${t("Keywords")}:`,
				item: createInput(null, words),
			},
			{
				title: `${t("Interupt")}:`,
				item: (
					<Switch
						size="medium"
						color={"primary"}
						checked={invisible}
						onClick={this.handleSwitchChange}
					/>
				),
			},
			{
				title: `${t("Param")}:`,
				item: createInput("заблокировано", "Параметр1", true),
			},
			{
				title: `${t("Param")}:`,
				item: createInput("заблокировано", "Параметр2", true),
			},
			{
				title: `${t("Confirmation text")}:`,
				item: createInput(null, `${t("Confirmation text")}`, true),
			},
		];
	};
	render() {
		const {
			localRule: { name },
		} = this.state;
		const data = this.createOptionsData();
		return (
			<div className="right-bar">
				<div className="right-bar__container">
					<Typography variant="h4" align="center" gutterBottom={true}>
						{name || "Выберите правило"}
					</Typography>
					{data.map(({ title, item }, index) => (
						<div className="custom-card" key={index}>
							<Typography variant="h5" component="h2" align="left">
								{title}
							</Typography>
							{item}
						</div>
					))}
				</div>
			</div>
		);
	}
}

RightBar.propTypes = {
	selectedRule: PropTypes.object,
};
