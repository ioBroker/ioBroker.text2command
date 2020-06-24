import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findMatched } from '@admin/langModel';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import { TextField, Box, withStyles } from '@material-ui/core';
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
});

class LeftBar extends Component {
    state = {
        textCommand: '',
        matchingRules: [],
    };
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
                })),
                textCommand: '',
            });
        }
    };

    findMatchingRules() {
        const text = this.state.textCommand;
        return text ? findMatched(text, JSON.parse(JSON.stringify(this.props.rules))) : [];
    }

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
                handler: () => console.log('save'),
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
                                handleEdit={handleEdit}
                                {...rule}
                                index={index}
                                moveRule={moveRule}
                                key={rule?.id}
                                selectRule={selectRule}
                                selectedRule={selectedRule}
                                matchingRules={this.state.matchingRules}
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
    selectedRule: PropTypes.shape({
        id: PropTypes.string,
    }),
    removeRule: PropTypes.func,
    handleEdit: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};
