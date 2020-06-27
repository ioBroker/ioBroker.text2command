import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import DialogActions from '@material-ui/core/DialogActions';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import {
    TextField,
    Typography,
    Box,
    withStyles,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Select,
    MenuItem,
} from '@material-ui/core';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import I18n from '@iobroker/adapter-react/i18n';
import Rule from './Rule';

const styles = theme => ({
    test: {
        position: 'absolute',
        bottom: '100px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
    },
    root: {
        width: '92%',
        '& .MuiOutlinedInput-notchedOutline-58': {
            border: `2px solid ${theme.palette.grey[700]}`,
        },
        '& #outlined-basic': {
            padding: '12px 10px',
        },
    },
    header: {
        height: 44,
        padding: theme.spacing(1.3),
        border: `1px solid ${theme.palette.divider}`,
    },
    textInput: {
        width: '60%',
    },
    select: {
        minWidth: '20%',
    },
    settingsTitle: {
        fontSize: '20px',
        maxWidth: 145,
    },
});

class LeftBar extends Component {
    state = {
        textCommand: '',
        matchingRules: [],
        isSettingsDialogOpen: false,
        localeSettings: {
            language: '',
            processorId: '',
            processorTimeout: 1000,
            sayitInstance: '',
        },
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.settings !== prevProps.settings && this.props.settings) {
            this.setState({
                localeSettings: {
                    ...this.props.settings,
                    language: this.props.settings.language || I18n.t('System'),
                },
            });
        }
    }

    handleTextCommand = event => {
        this.setState({
            textCommand: event.target.value,
        });
    };
    handleSubmit = event => {
        if (event.key === 'Enter') {
            const matched = this.findMatchingRules();
            this.setState({
                matchingRules: matched.map((number, index) => ({
                    indexOf: number,
                    timer: index * 500,
                    index,
                })),
                textCommand: '',
            });
        }
    };

    findMatchingRules() {
        const text = this.state.textCommand;
        return text ? window.findMatched(text, JSON.parse(JSON.stringify(this.props.rules))) : [];
    }

    handleOpenSettingsModal = () => {
        this.setState({
            isSettingsDialogOpen: true,
        });
    };

    handleDialogSelectIdSubmit = (selected, selectedSettingsName) => {
        this.setState({
            localeSettings: {
                ...this.state.localeSettings,
                [selectedSettingsName]: selected,
            },
        });
    };
    createSettingsModal = () => {
        const { t } = I18n;
        const options = [t('System'), 'en', 'de', 'ru'];
        const { classes } = this.props;

        const handleClose = () => {
            this.setState({
                isSettingsDialogOpen: false,
            });
        };

        const submitSettings = () => {
            this.props.saveSettings(this.state.localeSettings, handleClose);
        };

        const handleChange = (event, name) => {
            this.setState({
                localeSettings: {
                    ...this.state.localeSettings,
                    [name]: event.target.value,
                },
            });
        };

        const createInput = ({ value, handler, type, selectedSettingsName }) => {
            const onClickHandler = () => {
                if (type !== 'id') return;
                this.setState({
                    showDialogSelectId: true,
                    selectedSettingsName,
                });
            };
            if (!handler) {
                handler = () => {
                    return;
                };
            }
            return (
                <TextField
                    variant="outlined"
                    className={this.props.classes.textInput}
                    onClick={onClickHandler}
                    value={value}
                    onChange={handler}
                    size="small"
                />
            );
        };

        const settingsItems = [
            {
                item: (
                    <Select
                        onChange={event => handleChange(event, 'language')}
                        value={this.state.localeSettings.language}
                        className={classes.select}
                        autoWidth>
                        {Children.toArray(
                            options.map(option => <MenuItem value={option}>{option}</MenuItem>)
                        )}
                    </Select>
                ),
                title: t('Language'),
                id: 1,
            },
            {
                item: createInput({
                    value: this.state.localeSettings.sayitInstance,
                    type: 'id',
                    selectedSettingsName: 'sayitInstance',
                }),
                title: t('Answer in id'),
                id: 2,
            },
            {
                item: createInput({
                    value: this.state.localeSettings.processorId,
                    type: 'id',
                    selectedSettingsName: 'processorId',
                }),
                title: t(`Processor's id`),
                id: 3,
            },
            {
                item: createInput({
                    value: this.state.localeSettings.processorTimeout,
                    type: 'text',
                    handler: event => handleChange(event, 'processorTimeout'),
                }),
                title: t('Timeout for processor') + '(ms)',
                id: 4,
            },
        ];

        return (
            <Dialog open={this.state.isSettingsDialogOpen} onClose={handleClose} fullWidth>
                <DialogTitle>
                    <Typography variant="h4" component="span" align="center">
                        {t('Settings')}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {settingsItems.map(({ item, title, id }) => (
                        <Box display="flex" justifyContent="space-between" mb="10px" key={id}>
                            <Typography
                                variant="h5"
                                component="h5"
                                align="left"
                                className={classes.settingsTitle}>
                                {title}
                            </Typography>
                            {item}
                        </Box>
                    ))}
                    <DialogActions>
                        <Button onClick={submitSettings}>Ok</Button>
                        <Button onClick={handleClose}>{I18n.t('Cancel')}</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    };
    render() {
        const {
            selectedRule,
            moveRule,
            handleEdit,
            rules,
            selectRule,
            removeRule,
            classes,
        } = this.props;

        const mainIcons = [
            {
                icon: <AddIcon />,
                handler: () => this.props.handleOpen(),
            },
            {
                icon: <SettingsIcon />,
                handler: () => this.handleOpenSettingsModal(),
            },
            {
                icon: <CachedIcon />,
                handler: () => console.log('refresh'),
            },
        ];

        const additionalIcons = [
            {
                icon: <DeleteIcon />,
                handler: () => removeRule(selectedRule.id),
            },
            {
                icon: <SearchIcon />,
                handler: () => console.log('finding'),
            },
        ];

        const createIcons = iconsData =>
            iconsData.map(({ icon, handler }, index) => (
                <IconButton onClick={handler} key={index}>
                    {icon}
                </IconButton>
            ));

        return (
            <Box>
                <Box display="flex" justifyContent="space-between" className={classes.header}>
                    <div>{createIcons(mainIcons)}</div>
                    <div>{createIcons(additionalIcons)}</div>
                </Box>

                <DndProvider backend={HTML5Backend}>
                    <List>
                        {rules.map((rule, index) => (
                            <Rule
                                theme={this.props.theme}
                                handleEdit={handleEdit}
                                {...rule}
                                index={index}
                                moveRule={moveRule}
                                key={rule?.id}
                                selectRule={selectRule}
                                selectedRule={selectedRule}
                                matchingRules={this.state.matchingRules}
                                unsavedRules={this.props.unsavedRules}
                            />
                        ))}
                    </List>
                </DndProvider>

                <Toolbar className={classes.test}>
                    <TextField
                        onChange={this.handleTextCommand}
                        label={`${I18n.t('Test phrase')}`}
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        color="primary"
                        className={classes.root}
                        onKeyDown={this.handleSubmit}
                        value={this.state.textCommand}
                    />
                </Toolbar>
                {this.createSettingsModal()}

                {this.state.showDialogSelectId && (
                    <DialogSelectID
                        socket={this.props.socket}
                        title={'Select ID'}
                        onClose={id => {
                            this.setState({ showDialogSelectId: false });
                        }}
                        onOk={selected =>
                            this.handleDialogSelectIdSubmit(
                                selected,
                                this.state.selectedSettingsName
                            )
                        }
                    />
                )}
            </Box>
        );
    }
}

export default withStyles(styles)(LeftBar);

LeftBar.propTypes = {
    handleOpen: PropTypes.func.isRequired,
    rules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
        })
    ),
    moveRule: PropTypes.func.isRequired,
    selectRule: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    selectedRule: PropTypes.shape({
        id: PropTypes.string,
    }),
    removeRule: PropTypes.func,
    handleEdit: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object,
    socket: PropTypes.object.isRequired,
    saveSettings: PropTypes.func.isRequired,
    unsavedRules: PropTypes.object,
};
