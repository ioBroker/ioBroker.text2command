import React, { useRef, useImperativeHandle, useCallback, Children } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { ListItemIcon, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import { DropTarget, DragSource } from 'react-dnd';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
    listItem: {
        cursor: 'pointer',
        transition: 'background-color 0.3s linear',
    },
});

const Rule = React.forwardRef((props, ref) => {
    const {
        name,
        handleEdit,
        rule,
        isDragging,
        connectDragSource,
        connectDropTarget,
        id,
        selectRule,
        selectedRule,
        interupt,
    } = props;

    const classes = useStyles();

    const elementRef = useRef(null);
    connectDragSource(elementRef);
    connectDropTarget(elementRef);
    const opacity = isDragging ? 0 : 1;
    useImperativeHandle(ref, () => ({
        getNode: () => elementRef.current,
    }));

    const handleEditMemo = useCallback(() => handleEdit(id), [id, handleEdit]);
    const selectRuleMemo = useCallback(() => selectRule(id), [id, selectRule]);

    const icons = [
        {
            icon: interupt ? <DoneIcon color="primary" /> : <CloseIcon color="primary" />,
        },
        { icon: <EditIcon />, handleClick: handleEditMemo },
    ];

    return (
        <div
            ref={elementRef}
            style={{
                opacity,
            }}>
            <ListItem
                onClick={selectRuleMemo}
                style={{
                    backgroundColor: selectedRule?.id === id ? 'rgba(0, 0, 0, 0.06)' : '',
                }}
                className={classes.listItem}>
                <ListItemText primary={name} secondary={rule} />
                <ListItemIcon>
                    {Children.toArray(
                        icons.map(({ icon, handleClick }, index) => (
                            <IconButton disabled={!index} onClick={handleClick}>
                                {icon}
                            </IconButton>
                        ))
                    )}
                </ListItemIcon>
            </ListItem>
        </div>
    );
});

const ItemTypes = {
    RULE: 'rule',
};

export default DropTarget(
    ItemTypes.RULE,
    {
        hover(props, monitor, component) {
            if (!component) return null;

            const node = component.getNode();
            if (!node) {
                return null;
            }
            const dragIndex = monitor.getItem().index;
            const hoverIndex = props.index;
            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = node.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            props.moveRule(dragIndex, hoverIndex);

            monitor.getItem().index = hoverIndex;
        },
    },
    connect => ({ connectDropTarget: connect.dropTarget() })
)(
    DragSource(
        ItemTypes.RULE,
        {
            beginDrag: props => ({
                id: props.id,
                index: props.index,
            }),
        },
        (connect, monitor) => ({
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
        })
    )(Rule)
);

Rule.propTypes = {
    removeRule: PropTypes.func.isRequired,
    selectedRule: PropTypes.object.isRequired,
};
