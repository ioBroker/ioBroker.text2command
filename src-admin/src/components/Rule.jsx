import React, { useCallback, useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import PropTypes from 'prop-types';

import { ListItem, ListItemText, ListItemIcon, Tooltip, IconButton, Box } from '@mui/material';
import {
    Edit as EditIcon,
    ArrowDownward as ArrowDownwardIcon,
    Maximize as MaximizeIcon,
    FileCopy,
} from '@mui/icons-material';

import { Utils, I18n } from '@iobroker/adapter-react-v5';

const styles = {
    listItem: theme => ({
        cursor: 'pointer',
        transition: 'background-color 0.3s linear',
        position: 'relative',
        //paddingTop: '4px',
        //paddingBottom: '12px',
        alignItems: 'center',
        borderBottom: `1px dashed ${theme.palette.text.primary}${theme.palette.text.primary.startsWith('rgb') ? '' : '30'}`,
    }),
    listItemTextPrimary: theme => ({
        color: theme.palette.text.primary,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    }),
    listItemTextSecondary: theme => ({
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        opacity: theme.palette.mode === 'dark' ? 0.2 : 0.7,
        fontStyle: 'italic',
    }),
    dot: {
        position: 'absolute',
        backgroundColor: 'red',
        top: 3,
        right: 15,
        height: 10,
        fontSize: 10,
        borderRadius: 10,
        padding: '0 5px 5px 5px',
        textAlign: 'center',
        color: '#FFF',
    },
    maximize: theme => ({
        color: theme.palette.error?.dark,
        marginTop: '8px',
    }),
    ruleButton: {
        paddingTop: 12,
    },
    editButton: {
        height: 32,
    },
    words: theme => ({
        fontSize: 12,
        opacity: 0.5,
        width: 'calc(100% - 40px)',
        position: 'absolute',
        bottom: 4,
        left: 0,
        paddingLeft: '17px',
        color: theme.palette.text.primary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    emptyButton: {
        width: 30,
    },
    multiline: {
        marginTop: 0,
        //marginBottom: 12,
    },
};

const Rule = React.forwardRef(props => {
    const {
        name,
        handleEdit,
        handleCopy,
        rule,
        // isDragging,
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
        unique,
    } = props;

    const selectRuleMemo = useCallback(() => selectRule(id), [id, selectRule]);
    const handleEditMemo = useCallback(() => handleEdit(id), [id, handleEdit]);
    const handleCopyMemo = useCallback(() => handleCopy(id), [id, handleCopy]);

    const [ruleStyle, setRuleStyle] = useState({});

    useEffect(() => {
        if (matchingRules.length) {
            const matchingRule = matchingRules.find(item => item.indexOf === index);
            if (matchingRule) {
                setTimeout(
                    () =>
                        setRuleStyle({
                            backgroundColor:
                                theme.palette.mode === 'dark'
                                    ? theme?.palette?.secondary.dark
                                    : theme?.palette?.secondary.light,
                        }),
                    matchingRule.timer,
                );

                setTimeout(
                    () => {
                        setRuleStyle(
                            selectedRule.id === id ? { backgroundColor: theme?.palette?.background?.default } : {},
                        );
                        if (_break || index === matchingRules[matchingRules.length - 1].indexOf) {
                            removeMatched();
                        }
                    },
                    1500 * (matchingRule.index + 1),
                );
            } // only when matching rules have been changed
        } // eslint-disable-next-line
    }, [matchingRules]);

    const secondary = rule !== name ? rule || '' : '';

    return (
        <Draggable
            key={id}
            draggableId={id}
            index={index}
        >
            {(provided /* , snapshot */) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, ...ruleStyle }}
                >
                    <ListItem
                        onClick={selectRuleMemo}
                        selected={selectedRule?.id === id}
                        className={selectedRule?.id === id ? 'rule-selected' : ''}
                        sx={styles.listItem}
                    >
                        <ListItemText
                            primary={name}
                            secondary={secondary}
                            sx={{
                                '& .MuiListItemText-primary': styles.listItemTextPrimary,
                                '& .MuiListItemText-secondary': styles.listItemTextSecondary,
                                '& .MuiListItemText-multiline': styles.multiline,
                            }}
                        />
                        <ListItemIcon style={{ alignItems: 'center' }}>
                            {_break ? (
                                <Tooltip title={I18n.t('Interrupt processing')}>
                                    <MaximizeIcon
                                        sx={styles.maximize}
                                        style={styles.ruleButton}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title={I18n.t('Do not interrupt processing')}>
                                    <ArrowDownwardIcon
                                        style={styles.ruleButton}
                                        color="primary"
                                    />
                                </Tooltip>
                            )}
                            {!unique ? (
                                <Tooltip title={I18n.t('Copy rule')}>
                                    <IconButton
                                        onClick={handleCopyMemo}
                                        size="small"
                                        style={styles.editButton}
                                    >
                                        <FileCopy />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box sx={styles.emptyButton} />
                            )}
                            <Tooltip title={I18n.t('Edit name or type of rule')}>
                                <IconButton
                                    onClick={handleEditMemo}
                                    size="small"
                                    style={styles.editButton}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItemIcon>
                        {unsavedRules[id] && <div style={styles.dot}>{I18n.t('unsaved')}</div>}
                        <Box sx={styles.words}>[{words}]</Box>
                    </ListItem>
                </div>
            )}
        </Draggable>
    );
});

export default Rule;

Rule.propTypes = {
    removeRule: PropTypes.func,
    name: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    //    isDragging: PropTypes.bool,
    connectDropTarget: PropTypes.func,
    connectDragTarget: PropTypes.func,
    _break: PropTypes.bool.isRequired,
    selectRule: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    matchingRules: PropTypes.array,
    unique: PropTypes.bool,
    selectedRule: PropTypes.shape({ id: PropTypes.string }),
    unsavedRules: PropTypes.object,
};
