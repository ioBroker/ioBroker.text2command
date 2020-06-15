import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
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
    },
    root: {
        width: '92%',
        '& .MuiOutlinedInput-notchedOutline-55': {
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
    handleTextCommand = () => {};

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
                icon: <SaveIcon />,
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
                            />
                        ))}
                    </List>
                </DndProvider>

                <Box className={classes.test} display="flex" justifyContent="center">
                    <TextField
                        onChange={this.handleTextCommand}
                        label={`${I18n.t('Test phrase')}`}
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        color="primary"
                        className={classes.root}
                    />
                </Box>
            </Box>
        );
    }
}

export default withStyles(styles)(LeftBar);

LeftBar.propTypes = {
    handleOpen: PropTypes.func.isRequired,
    rules: PropTypes.array.isRequired,
    moveRule: PropTypes.func.isRequired,
    selectedRule: PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
        rule: PropTypes.string,
        ack: PropTypes.shape({
            default: PropTypes.string,
            value: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
        }),
        arg: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                type: PropTypes.string,
                default: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
            })
        ),
        words: PropTypes.string,
    }).isRequired,
    removeRule: PropTypes.func,
    classes: PropTypes.object.isRequired,
};
