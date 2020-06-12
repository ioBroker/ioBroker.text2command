import React, { useRef, useImperativeHandle, useCallback } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { ListItemIcon, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { DropTarget, DragSource } from 'react-dnd';

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
    } = props;

    const elementRef = useRef(null);
    connectDragSource(elementRef);
    connectDropTarget(elementRef);
    const opacity = isDragging ? 0 : 1;
    useImperativeHandle(ref, () => ({
        getNode: () => elementRef.current,
    }));

    const handleEditMemo = useCallback(() => handleEdit(id), [id, handleEdit]);
    const selectRuleMemo = useCallback(() => selectRule(id), [id, selectRule]);

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
                }}>
                <ListItemText primary={name} secondary={rule} />
                <ListItemIcon>
                    <IconButton onClick={handleEditMemo}>
                        <EditIcon />
                    </IconButton>
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
