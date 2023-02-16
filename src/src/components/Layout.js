import React, { PureComponent } from 'react';
import SplitterLayout from 'react-splitter-layout';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withWidth, Utils, I18n } from '@iobroker/adapter-react-v5';
import 'react-splitter-layout/lib/index.css';

import Drawer from '@mui/material/Drawer';

import isEqual from 'lodash.isequal';
import DrawerComponent from './Drawer';
import RuleEditor from './RuleEditor';
import CreateRuleDialog from './CreateRuleDialog';

const styles = theme => ({
    layout: {
        '& .layout-pane:first': {
            overflow: 'hidden',
        },
    },
    hidden: {
        '& .layout-pane:first-child': {
            width: '0 !important',
        },
        background: theme.palette.background.default,
    },
    opened: {
        '& .layout-pane-primary': {
            width: '',
        },
        overflow: 'hidden',
        background: theme.palette.background.default,
    },
    noRulesText: {
        fontSize: 24,
        color: theme.palette.primary.light,
        textAlign: 'center',
        paddingTop: theme.spacing(2),
    },
});

class Layout extends PureComponent {
    constructor(props) {
        super(props);

        this.menuSize = parseFloat(window.localStorage.getItem('App.menuSize')) || 350;
        this.state = {
            rules: [],
            isOpen: false,
            isEdit: false,
            isCopy: false,
            selectedRule: null,
            unsavedRules: {},
            ready: false,
            isLeftBarOpen: window.localStorage.getItem('App.menuHidden') === 'true',
        };
        this.commands = this.getSelectedLanguageCommands();

        this.isMobile = this.props.width === 'sm' || this.props.width === 'xs';
    }

    componentDidMount() {
        this.getDataFromConfig()
            .then(({ rules, ...settings }) => {
                const rulesWithId = rules.map(rule =>
                    (!rule.id || !rule.name
                        ? {
                            ...rule,
                            id: rule.id || uuid(),
                            name: rule.name || window.commands[rule.template]?.name[I18n.getLanguage()] || window.commands[rule.template]?.name.en,
                        }
                        : rule));

                if (!isEqual(rules, rulesWithId)) {
                    this.props.saveConfig({ rules: rulesWithId, ...settings });
                    setTimeout(() => this.setState({ rules: rulesWithId }), 50);
                }
            });

        if (this.isMobile) {
            this.setState({ isLeftBarOpen: true });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.settings?.language !== this.state.lang && this.state.settings?.language) {
            const lang = this.state.settings?.language;
            I18n.setLanguage(lang);

            this.commands = this.getSelectedLanguageCommands();
        }

        if (
            prevState.selectedRule?.id !== this.state.selectedRule?.id &&
            prevState.selectedRule?.id && this.state.selectedRule
        ) {
            localStorage.setItem('selectedRule', this.state.selectedRule.id);
        }
    }

    getSelectedLanguageCommands = () => {
        const lang = this.state?.settings?.language || I18n.getLanguage();

        return [
            { rule: I18n.t('Select rule'), unique: false },
            ...Object.entries(window.commands).map(item => {
                const [key, command] = item;
                const { name, ...rest } = command;
                return {
                    ...rest,
                    rule: command?.name[lang],
                    template: key,
                    unique: command.unique,
                    words: command.words && command.words[lang],
                    args: command.args?.map(arg => ({
                        ...arg,
                        name: arg.name[lang] || '',
                        default: arg.default !== undefined ? arg.default : (arg.type === 'checkbox' ? false : ''),
                    })),
                    ack: command.ack && {
                        ...command.ack,
                        name: command.ack.name[lang],
                        default: !command.ack?.default
                            ? command.ack?.type === 'checkbox'
                                ? false
                                : ''
                            : command.ack.default[lang],
                    },
                };
            }),
        ];
    };

    moveRule = (sourceIndex, destIndex) => {
        const rules = JSON.parse(JSON.stringify(this.state.rules));
        const sourceRule = rules[sourceIndex];
        rules.splice(sourceIndex, 1);
        rules.splice(destIndex, 0, sourceRule);

        this.setState({ rules }, () =>
            this.props.readConfig()
                .then(config => {
                    const newConfig = JSON.parse(JSON.stringify(config));
                    newConfig.rules = rules;
                    this.props.saveConfig(newConfig);
                }));
    };

    handleOpen = add => {
        if (add) {
            this.setState({ isEdit: false, isCopy: false, isOpen: true });
        } else {
            this.setState({ isOpen: true });
        }
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleSubmitOnCreate = (selectedRule, isError) => {
        if (isError) {
            return;
        }

        const id = uuid();
        const shortDataRule = {
            ...selectedRule,
            id,
            _break: true,
        };

        const rule = {
            ...this.commands.find(command => command.rule === shortDataRule.rule),
            ...shortDataRule,
        };
        const isUnsavedChanges = Object.values(this.state.unsavedRules).length;

        this.setState(
            {
                rules: [...this.state.rules, rule],
                unsavedRules: {
                    ...this.state.unsavedRules,
                    [id]: {
                        id,
                        wasChangedGlobally: true,
                    },
                },
                selectedRule: !isUnsavedChanges ? rule : this.state.selectedRule,
            },
            () => {
                if (isUnsavedChanges) {
                    this.selectRule(rule.id);
                }
            },
        );

        this.handleClose();
    };

    handleSubmitOnEdit = (selectedRule, isError, isSave) => {
        if (isError) {
            return;
        }

        const newState = {
            rules: this.updateRule(selectedRule),
            selectedRule,
        };

        if (isSave) {
            newState.unsavedRules = {};
        } else {
            const unsavedRules = JSON.parse(JSON.stringify(this.state.unsavedRules));
            unsavedRules[selectedRule.id] = { id: selectedRule.id, wasChangedGlobally: true };

            newState.unsavedRules = unsavedRules;
        }

        this.setState(newState, () => {
            this.handleClose();

            if (isSave) {
                this.props.readConfig()
                    .then(config => {
                        const newConfig = JSON.parse(JSON.stringify(config));
                        newConfig.rules = newState.rules;
                        this.props.saveConfig(newConfig);
                    });
            }
        });
    };

    handleSubmitOnCopy = (selectedRule, isError, isSave) => {
        if (isError) {
            return;
        }

        const newRule = JSON.parse(JSON.stringify(selectedRule));
        newRule.id = uuid();

        const rules = JSON.parse(JSON.stringify(this.state.rules));
        rules.push(newRule);

        const newState = {
            rules,
            selectedRule: newRule,
            isOpen: false,
        };

        if (isSave) {
            newState.unsavedRules = {};
        } else {
            const unsavedRules = JSON.parse(JSON.stringify(this.state.unsavedRules));
            unsavedRules[newRule.id] = { id: newRule.id, wasChangedGlobally: true };
            newState.unsavedRules = unsavedRules;
        }

        this.setState(newState, () => {
            this.selectRule(newRule.id);

            if (isSave) {
                this.props.readConfig()
                    .then(config => {
                        const newConfig = JSON.parse(JSON.stringify(config));
                        newConfig.rules = rules;
                        this.props.saveConfig(newConfig);
                    });
            }
        });
    };

    selectRule = id => {
        const { selectedRule, rules } = this.state;

        if (selectedRule.id === id) {
            // ignore
            if (this.isMobile) {
                this.setState({ isLeftBarOpen: false });
            }
        } else if (this.state.unsavedRules[selectedRule.id]) {
            this.setState({
                pendingSelectedRuleId: id,
            });
        } else {
            const rule = rules.find(item => item.id === id);

            this.setState({
                selectedRule: rule,
                isLeftBarOpen: this.isMobile ? false : this.state.isLeftBarOpen,
            });
        }
    };

    updateRule = selectedRule => {
        const rules = JSON.parse(JSON.stringify(this.state.rules));

        const index = rules.findIndex(item => item.id === selectedRule.id);
        rules[index] = selectedRule;

        return rules;
    };

    handleEdit = () => {
        this.setState({ isEdit: true, isCopy: false }, () =>
            this.handleOpen());
    };

    handleCopy = () => {
        this.setState({ isCopy: true, isEdit: true }, () =>
            this.handleOpen());
    };

    finishEdit = editableRule => {
        let selectedRule;

        const {
            rule, id, name, _break, template,
        } = editableRule;

        // if rule was updated => apply fields
        if (this.state.selectedRule.rule !== rule) {
            const updatedRuleOptions = this.commands.find(command => command.rule === rule);

            selectedRule = {
                ...updatedRuleOptions,
                name,
                rule,
                id,
                _break,
                template,
            };
        } else {
            selectedRule = JSON.parse(JSON.stringify(editableRule));
        }

        const rules = JSON.parse(JSON.stringify(this.state.rules));
        const index = rules.findIndex(it => it.id === selectedRule.id);
        if (index !== -1) {
            rules[index] = selectedRule;
        } else {
            rules.push(selectedRule);
        }

        this.setState({
            isEdit: false,
            isCopy: false,
            rules,
            selectedRule,
        });
    };

    removeRule = id => {
        let rules = JSON.parse(JSON.stringify(this.state.rules));
        rules = rules.filter(rule => rule.id !== id);

        this.setState(
            {
                rules,
                selectedRule: rules.length ? rules[rules.length - 1] : null,
            },
            () => {
                this.props.readConfig()
                    .then(config => {
                        const newConfig = JSON.parse(JSON.stringify(config));
                        newConfig.rules = rules;
                        this.props.saveConfig(newConfig);
                    });
            },
        );
    };

    updateConfig = async currentSelectedRule => {
        const { [currentSelectedRule.id]: removedId, ...ids } = this.state.unsavedRules;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const matchingRule = rules.find(rule => rule.id === currentSelectedRule.id);
        const updatedCurrentRules = this.updateRule(currentSelectedRule);

        let updatedRules;
        if (matchingRule) {
            updatedRules = rules.map(rule =>
                (rule.id === currentSelectedRule.id
                    ? Layout.getRuleShortData(currentSelectedRule)
                    : rule));
        } else {
            updatedRules = [...rules, Layout.getRuleShortData(currentSelectedRule)];
        }

        const newConfig = { rules: updatedRules, ...settings };
        await this.props.saveConfig(newConfig);

        this.setState({
            selectedRule: currentSelectedRule || this.state.selectedRule || null,
            rules: updatedCurrentRules,
            unsavedRules: ids,
        });
    };

    getDataFromConfig = () => this.props.readConfig()
        .then(config => {
            const { rules, ...settings } = config;
            const lang = I18n.getLanguage();

            const currentRules = rules.map(rule => {
                const obj = window.commands[rule?.template];

                if (!obj) {
                    window.alert(`Unknown rule: "${rule?.template}". Please report an issue on Github!`);
                    return null;
                }

                return {
                    ...obj,
                    rule: obj.name[lang] || obj.name.en,
                    ack: {
                        ...obj.ack,
                        default: rule.ack ? rule.ack.default : (obj.ack?.type === 'checkbox' ? false : ''),
                        name: obj.ack?.name[lang] || obj.ack?.name.en,
                    },
                    args: obj.args?.map((arg, index) => ({
                        ...arg,
                        default: rule.args[index] ? rule.args[index].default : (arg?.type === 'checkbox' ? false : ''),
                        name: arg?.name[lang] || arg?.name.en || '',
                    })),
                    name: rule.name || obj.name[lang] || obj.name.en,
                    words: rule.words,
                    _break: rule._break,
                    id: rule.id || uuid(),
                    template: rule.template,
                };
            })
                .filter(rule => rule);

            this.setState({
                rules: currentRules,
                ready: true,
                selectedRule:
                        currentRules.find(rule => rule.id === localStorage.getItem('selectedRule')) ||
                        currentRules[currentRules.length - 1] ||
                        null,
                settings,
            });

            return config;
        });

    revertChangesFromConfig = async selectedRule => {
        const actualRules = this.state.rules;
        const { [selectedRule.id]: removedId, ...ids } = this.state.unsavedRules;
        const config = await this.props.readConfig();
        const { rules, ...settings } = config;

        const matchingRule = rules.find(rule => rule.id === selectedRule.id);
        const isRuleWasUpdatedGlobally = this.state.unsavedRules[selectedRule.id]
            ?.wasChangedGlobally;

        let updatedRules;
        if (matchingRule && isRuleWasUpdatedGlobally) {
            updatedRules = actualRules.map(rule =>
                (rule.id === matchingRule.id
                    ? {
                        ...rule,
                        ack: {
                            ...rule.ack,
                            default: matchingRule.ack || '',
                        },
                        args: rule.args?.map(arg => ({
                            ...arg,
                            default: matchingRule.arg || '',
                        })),
                        rule: window.commands[matchingRule.template].name[I18n.getLanguage()],
                        words: matchingRule.words || '',
                        name: matchingRule.name || '',
                        _break: matchingRule._break || true,
                    }
                    : rule));
        } else if (!matchingRule) {
            updatedRules = actualRules.filter(rule => rule.id !== selectedRule.id);
        }

        const newState = {
            rules: updatedRules || actualRules,
            selectedRule:
                (isRuleWasUpdatedGlobally
                    ? updatedRules.find(rule => rule.id === selectedRule.id)
                    : this.state.selectedRule) || null,
            settings,
            unsavedRules: ids,
        };

        if (this.state.rules.length !== newState.rules.length) {
            newState.selectedRule = newState.rules[newState.rules.length - 1] || null;
        }

        this.setState(newState);
    };

    saveSettings = async (localeSettings, closeModal) => {
        const config = await this.props.readConfig();
        const { rules } = config;

        const newConfig = { rules, ...localeSettings };
        await this.props.saveConfig(newConfig);
        this.setState({ settings: localeSettings }, () =>
            closeModal());
    };

    setUnsavedRule = id => {
        this.setState({
            unsavedRules: {
                ...this.state.unsavedRules,
                [id]: {
                    id,
                    wasChangedGlobally: false,
                },
            },
        });
    };

    removeUnsavedRule = id => {
        const { [id]: removedId, ...ids } = this.state.unsavedRules;
        this.setState({
            unsavedRules: ids,
        });
    };

    static getRuleShortData({
        _break, template, words, ack, args, name, id,
    }) {
        return {
            words: words || '',
            ack: ack?.default || '',
            args: args?.map(arg => arg.default) || [],
            _break,
            template,
            name,
            id,
        };
    }

    clearStateOnConfirmModalUnmount = id => {
        const { [id]: removedId, ...ids } = this.state.unsavedRules;

        this.setState({
            pendingSelectedRuleId: false,
            unsavedRules: ids,
        });
    };

    toggleLeftBar = () => {
        window.localStorage.setItem('App.menuHidden', !this.state.isLeftBarOpen);
        this.setState({ isLeftBarOpen: !this.state.isLeftBarOpen });
    };

    closeDrawer = () => {
        this.setState({ isLeftBarOpen: false });
    };

    renderModalDialog() {
        if (!this.state.isOpen) {
            return null;
        }
        return <CreateRuleDialog
            key="modal"
            commands={this.commands}
            isEdit={this.state.isEdit}
            isCopy={this.state.isCopy}
            handleSubmitOnCreate={this.handleSubmitOnCreate}
            handleSubmitOnEdit={this.handleSubmitOnEdit}
            handleSubmitOnCopy={this.handleSubmitOnCopy}
            handleClose={this.handleClose}
            isOpen
            rules={this.state.rules}
            selectedRule={this.state.selectedRule}
            finishEdit={this.finishEdit}
        />;
    }

    render() {
        console.log(this.state);
        const { classes } = this.props;
        const { rules, selectedRule, isLeftBarOpen } = this.state;

        if (!this.state.ready) {
            return null;
        }

        if (this.isMobile) {
            return <>
                <Drawer
                    anchor="left"
                    open={this.state.isLeftBarOpen}
                    onClose={this.closeDrawer}
                >
                    <DrawerComponent
                        themeType={this.props.themeType}
                        handleOpen={this.handleOpen}
                        rules={rules}
                        moveRule={this.moveRule}
                        handleEdit={this.handleEdit}
                        handleCopy={this.handleCopy}
                        selectRule={this.selectRule}
                        selectedRule={selectedRule}
                        removeRule={this.removeRule}
                        settings={this.state.settings}
                        socket={this.props.socket}
                        saveSettings={this.saveSettings}
                        theme={this.props.theme}
                        toggleLeftBar={this.toggleLeftBar}
                        unsavedRules={this.state.unsavedRules}
                        isMobile={this.isMobile}
                        closeDrawer={this.closeDrawer}
                    />
                </Drawer>
                {this.state.settings && selectedRule ?
                    <RuleEditor
                        key={selectedRule.id}
                        selectedRule={selectedRule}
                        socket={this.props.socket}
                        updateConfig={this.updateConfig}
                        revertChangesFromConfig={this.revertChangesFromConfig}
                        pendingSelectedRuleId={this.state.pendingSelectedRuleId}
                        unsavedRules={this.state.unsavedRules}
                        selectRule={this.selectRule}
                        clearStateOnConfirmModalUnmount={this.clearStateOnConfirmModalUnmount}
                        lang={this.state.settings.language}
                        setUnsavedRule={this.setUnsavedRule}
                        removeUnsavedRule={this.removeUnsavedRule}
                        toggleLeftBar={this.toggleLeftBar}
                        isLeftBarOpen={this.state.isLeftBarOpen}
                        isMobile={this.isMobile}
                    />
                    :
                    <div className={classes.noRulesText}>{I18n.t('Create a new rule with a "+" on the left')}</div>}

                {this.renderModalDialog()}
            </>;
        }
        return <>
            <SplitterLayout
                key="splitterLayout"
                customClassName={Utils.clsx(
                    isLeftBarOpen ? classes.hidden : classes.opened,
                    classes.layout,
                )}
                primaryMinSize={350}
                primaryIndex={1}
                secondaryMinSize={350}
                onSecondaryPaneSizeChange={size => (this.menuSize = parseFloat(size))}
                onDragEnd={() => window.localStorage.setItem('App.menuSize', this.menuSize.toString())}
                secondaryInitialSize={this.menuSize}
            >
                <DrawerComponent
                    handleOpen={this.handleOpen}
                    rules={rules}
                    moveRule={this.moveRule}
                    handleEdit={this.handleEdit}
                    handleCopy={this.handleCopy}
                    selectRule={this.selectRule}
                    selectedRule={selectedRule}
                    removeRule={this.removeRule}
                    instance={this.props.instance}
                    settings={this.state.settings}
                    socket={this.props.socket}
                    saveSettings={this.saveSettings}
                    theme={this.props.theme}
                    unsavedRules={this.state.unsavedRules}
                    isMobile={this.isMobile}
                />
                {this.state.settings && selectedRule ?
                    <RuleEditor
                        selectedRule={selectedRule}
                        socket={this.props.socket}
                        updateRule={this.updateRule}
                        updateConfig={this.updateConfig}
                        revertChangesFromConfig={this.revertChangesFromConfig}
                        pendingSelectedRuleId={this.state.pendingSelectedRuleId}
                        unsavedRules={this.state.unsavedRules}
                        selectRule={this.selectRule}
                        clearStateOnConfirmModalUnmount={this.clearStateOnConfirmModalUnmount}
                        lang={this.state.settings.language}
                        setUnsavedRule={this.setUnsavedRule}
                        removeUnsavedRule={this.removeUnsavedRule}
                        toggleLeftBar={this.toggleLeftBar}
                        isLeftBarOpen={this.state.isLeftBarOpen}
                        isMobile={this.isMobile}
                    />
                    :
                    <div className={classes.noRulesText}>{I18n.t('Create a new rule with a "+" on the left')}</div>}
            </SplitterLayout>
            {this.renderModalDialog()}
        </>;
    }
}

Layout.propTypes = {
    socket: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    themeType: PropTypes.string,
    instance: PropTypes.number.isRequired,
    readConfig: PropTypes.func.isRequired,
    saveConfig: PropTypes.func.isRequired,
};

export default withStyles(styles)(withWidth()(Layout));
