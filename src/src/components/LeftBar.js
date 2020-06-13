import React, { Component } from 'react';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import CachedIcon from '@material-ui/icons/Cached';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Rule from './Rule';
import PropTypes from 'prop-types';

export default class LeftBar extends Component {
    render() {
        const { selectedRule, moveRule, handleEdit, rules, selectRule } = this.props;

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
                handler: () => console.log('rule deleted'),
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
            </div>
        );
    }
}

LeftBar.propTypes = {
    handleOpen: PropTypes.func.isRequired,
    rules: PropTypes.array.isRequired,
    moveRule: PropTypes.func.isRequired,
    selectedRule: PropTypes.object.isRequired,
};
