import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import { TextField } from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import I18n from '@iobroker/adapter-react/i18n';
import Rule from './Rule';

export default class LeftBar extends Component {
    handleTextCommand = () => {};

    render() {
        const { selectedRule, moveRule, handleEdit, rules, selectRule, removeRule } = this.props;

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
            <div className="left-bar">
                <div className="left-bar__header">
                    <div>{createIcons(mainIcons)}</div>
                    <div>{createIcons(additionalIcons)}</div>
                </div>

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

                <div className="test">
                    <TextField
                        onChange={this.handleTextCommand}
                        label={`${I18n.t('Test phrase')}`}
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        color="primary"
                    />
                </div>
            </div>
        );
    }
}

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
};
