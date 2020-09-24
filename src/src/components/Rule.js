import React, {
    useRef,
    useImperativeHandle,
    useCallback,
    useState,
    useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { DropTarget, DragSource } from 'react-dnd';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import I18n from '@iobroker/adapter-react/i18n';

import EditIcon from '@material-ui/icons/Edit';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import MaximizeIcon from '@material-ui/icons/Maximize';

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
        unsavedRules,
        index,
        theme,
        removeMatched,
        words,
    } = props;

    const classes = makeStyles({
        listItem: {
            cursor: 'pointer',
            transition: 'background-color 0.3s linear',
            position: 'relative',
        },
        listItemText: {
            '& span': {
                color: theme.palette.text.primary,
            },
            '& p': {
                color: theme.palette.text.secondary,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
            },
        },
        dot: {
            position: 'absolute',
            backgroundColor: 'red',
            top: 5,
            right: 15,
            width: 10,
            height: 10,
            borderRadius: '50%',
        },
        maximize: {
            color: theme.palette.error?.dark,
            marginTop: theme.spacing(1),
        },
        ruleButton: {
            paddingTop: theme.spacing(1.5),
        }
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

    const [bg, setBg] = useState('');

    useEffect(() => {
        if (matchingRules.length) {
            const matchingRule = matchingRules.find(item => item.indexOf === index);
            if (matchingRule) {
                setTimeout(() => setBg(theme?.palette?.secondary.dark), matchingRule.timer);
                setTimeout(() => {
                    setBg(selectedRule.id === id ? theme?.palette?.background?.default : '');
                    if (_break || index === matchingRules[matchingRules.length - 1].indexOf) removeMatched();
                }, 1500 * (matchingRule.index + 1));
            } // only when matching rules have been changed
        } // eslint-disable-next-line
    }, [matchingRules]);

    let secondary = rule !== name ? rule || '' : '';
    secondary += `${secondary ? ' ' : ''}[${words}]`;
    return <div
        ref={elementRef}
        style={{
            opacity,
            backgroundColor: bg,
        }}>
        <ListItem
            onClick={selectRuleMemo}
            selected={selectedRule?.id === id}
            className={clsx(classes.listItem, selectedRule?.id === id && 'rule-selected')}>
            <ListItemText
                primary={name}
                secondary={secondary}
                className={classes.listItemText}
            />
            <ListItemIcon>
                {
                    _break ?
                        <Tooltip title={I18n.t('Interrupt processing')}>
                            <MaximizeIcon className={clsx(classes.ruleButton, classes.maximize)} />
                        </Tooltip>
                    :
                        <Tooltip title={I18n.t('Do not interrupt processing')}><ArrowDownwardIcon className={classes.ruleButton} color="primary"/></Tooltip>
                }
                <Tooltip title={I18n.t('Edit name or type of rule')}><IconButton onClick={handleEditMemo}><EditIcon /></IconButton></Tooltip>
            </ListItemIcon>
            {unsavedRules[id] && <Box className={classes.dot} />}
        </ListItem>
    </div>;
});

const ItemTypes = {
    RULE: 'rule',
};

export default DropTarget(
    ItemTypes.RULE,
    {
        hover(props, monitor, component) {
            if (!component) {
                return null;
            }

            const node = component.getNode();
            if (!node) {
                return null;
            }
            const dragIndex = monitor.getItem().index;
            const hoverIndex = props.index;
            if (dragIndex === hoverIndex) {
                return;
            }

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
    unsavedRules: PropTypes.object,
};
