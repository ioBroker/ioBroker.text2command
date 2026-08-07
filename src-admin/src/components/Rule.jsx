import React, { useCallback, useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';

import PropTypes from 'prop-types';

import { ListItemButton, Tooltip, IconButton, Box, Typography, Chip } from '@mui/material';
import {
    Edit as EditIcon,
    ArrowDownward as ArrowDownwardIcon,
    Maximize as MaximizeIcon,
    FileCopy,
} from '@mui/icons-material';

import { I18n } from '@iobroker/gui-components';

// The selected state is painted by the ioBroker theme (gradient + white text), like in Admin 8.
// Everything here only has to make sure the own colors do not fight against it.
const styles = {
    listItem: {
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.75,
        pl: 1.25,
        pr: 0.5,
        mx: 0.5,
        my: 0.25,
        width: 'auto',
    },
    texts: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        flexGrow: 1,
        overflow: 'hidden',
    },
    name: selected => ({
        color: selected ? 'inherit' : 'text.primary',
        fontWeight: selected ? 700 : 400,
        fontSize: 15,
        lineHeight: 1.3,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    }),
    type: selected => ({
        color: selected ? 'inherit' : 'text.secondary',
        opacity: selected ? 0.85 : 1,
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 1.4,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    }),
    words: selected => ({
        fontSize: 11,
        lineHeight: 1.4,
        opacity: selected ? 0.8 : 0.6,
        color: selected ? 'inherit' : 'text.primary',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    buttons: {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    breakIcon: selected => theme => ({
        color: selected ? 'inherit' : theme.palette.error?.dark,
    }),
    iconButton: selected => ({
        height: 32,
        width: 32,
        color: selected ? 'inherit' : undefined,
    }),
    emptyButton: {
        width: 32,
    },
    unsaved: {
        height: 16,
        fontSize: 10,
        ml: 1,
        flexShrink: 0,
    },
};

const Rule = React.forwardRef((props, ref) => {
    const {
        name,
        handleEdit,
        handleCopy,
        rule,
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
        isDragDisabled,
    } = props;

    const selected = selectedRule?.id === id;

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
                        // let the selection styling take over again
                        setRuleStyle({});
                        if (_break || index === matchingRules[matchingRules.length - 1].indexOf) {
                            removeMatched();
                        }
                    },
                    1500 * (matchingRule.index + 1),
                );
            } // only when matching rules have been changed
        } // eslint-disable-next-line
    }, [matchingRules]);

    // the type of the rule is only interesting if the user renamed it
    const type = rule !== name ? rule || '' : '';

    return (
        <Draggable
            key={id}
            draggableId={id}
            index={index}
            isDragDisabled={!!isDragDisabled}
        >
            {(provided /* , snapshot */) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, ...ruleStyle }}
                >
                    <ListItemButton
                        ref={ref}
                        onClick={selectRuleMemo}
                        selected={selected}
                        className={selected ? 'rule-selected' : ''}
                        sx={styles.listItem}
                    >
                        <Box sx={styles.texts}>
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                <Typography
                                    component="div"
                                    sx={styles.name(selected)}
                                >
                                    {name}
                                </Typography>
                                {unsavedRules[id] ? (
                                    <Chip
                                        label={I18n.t('unsaved')}
                                        color="error"
                                        size="small"
                                        sx={styles.unsaved}
                                    />
                                ) : null}
                            </Box>
                            {type ? (
                                <Typography
                                    component="div"
                                    sx={styles.type(selected)}
                                >
                                    {type}
                                </Typography>
                            ) : null}
                            <Box sx={styles.words(selected)}>{words ? `[${words}]` : ''}</Box>
                        </Box>
                        <Box sx={styles.buttons}>
                            {_break ? (
                                <Tooltip title={I18n.t('Interrupt processing')}>
                                    <MaximizeIcon sx={styles.breakIcon(selected)} />
                                </Tooltip>
                            ) : (
                                <Tooltip title={I18n.t('Do not interrupt processing')}>
                                    <ArrowDownwardIcon color={selected ? 'inherit' : 'primary'} />
                                </Tooltip>
                            )}
                            {!unique ? (
                                <Tooltip title={I18n.t('Copy rule')}>
                                    <IconButton
                                        onClick={handleCopyMemo}
                                        size="small"
                                        sx={styles.iconButton(selected)}
                                    >
                                        <FileCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Box sx={styles.emptyButton} />
                            )}
                            <Tooltip title={I18n.t('Edit name or type of rule')}>
                                <IconButton
                                    onClick={handleEditMemo}
                                    size="small"
                                    sx={styles.iconButton(selected)}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </ListItemButton>
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
    connectDropTarget: PropTypes.func,
    connectDragTarget: PropTypes.func,
    _break: PropTypes.bool.isRequired,
    selectRule: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    matchingRules: PropTypes.array,
    unique: PropTypes.bool,
    selectedRule: PropTypes.shape({ id: PropTypes.string }),
    unsavedRules: PropTypes.object,
    isDragDisabled: PropTypes.bool,
};
