import React, {
    useRef,
    useImperativeHandle,
    useCallback,
    Children,
    useState,
    useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { ListItemIcon, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

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
        _break,
        matchingRules,
        index,
        theme,
    } = props;

    const classes = makeStyles({
        listItem: {
            cursor: 'pointer',
            transition: 'background-color 0.3s linear',
        },
        listItemText: {
            '& span': {
                color: theme.palette.text.primary,
            },
            '& p': {
                color: theme.palette.text.secondary,
            },
        },
    })();

    const elementRef = useRef(null);
    connectDragSource(elementRef);
    connectDropTarget(elementRef);
    const opacity = isDragging ? 0 : 1;
    useImperativeHandle(ref, () => ({
        getNode: () => elementRef.current,
    }));

    const selectRuleMemo = useCallback(() => selectRule(id), [id, selectRule]);
    const handleEditMemo = useCallback(() => handleEdit(id), [id, handleEdit]);

    const icons = [
        {
            icon: _break ? <DoneIcon color="primary" /> : <CloseIcon color="primary" />,
        },
        { icon: <EditIcon />, handleClick: handleEditMemo },
    ];

    const [setBg] = useState('');

    useEffect(() => {
        if (matchingRules.length) {
            const matchingRule = matchingRules.find(item => item.indexOf === index);
            if (matchingRule) {
                setTimeout(() => setBg('lightblue'), matchingRule.timer);
                setTimeout(
                    () => setBg(selectedRule.id === id ? this.props.theme.palette.background : ''),
                    500 * (matchingRule.index + 1)
                );
            } // only when matching rules have been changed
        } // eslint-disable-next-line
    }, [matchingRules]);

    return (
        <div
            ref={elementRef}
            style={{
                opacity,
            }}>
            <ListItem
                onClick={selectRuleMemo}
                selected={selectedRule?.id === id}
                className={classes.listItem}>
                <ListItemText
                    primary={name}
                    secondary={rule !== name ? rule : ''}
                    className={classes.listItemText}
                />
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
    removeRule: PropTypes.func,
    name: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    isDragging: PropTypes.bool,
    connectDropTarget: PropTypes.func,
    connectDragTarget: PropTypes.func,
    _break: PropTypes.bool.isRequired,
    selectRule: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    matchingRules: PropTypes.array,
    selectedRule: PropTypes.shape({
        id: PropTypes.string,
    }),
};
