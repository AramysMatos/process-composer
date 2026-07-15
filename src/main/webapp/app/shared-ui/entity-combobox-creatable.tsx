import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Badge, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'react-jhipster';

import './entity-combobox-creatable.scss';

export interface IEntityComboboxItem {
  id: number;
  name: string;
}

export interface IEntityComboboxCreatableProps {
  options: IEntityComboboxItem[];
  value: IEntityComboboxItem[];
  onChange: (selected: IEntityComboboxItem[]) => void;
  onCreateNew?: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'data-cy'?: string;
}

type SuggestionItem = { type: 'create'; name: string } | { type: 'option'; option: IEntityComboboxItem };

const normalizeName = (name: string): string => name.trim().toLowerCase();

const isSelected = (selected: IEntityComboboxItem[], option: IEntityComboboxItem): boolean => selected.some(item => item.id === option.id);

export const EntityComboboxCreatable = ({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder,
  disabled = false,
  id,
  className,
  'data-cy': dataCy,
}: IEntityComboboxCreatableProps) => {
  const generatedId = useId();
  const comboboxId = id ?? `entity-combobox-${generatedId}`;
  const listboxId = `${comboboxId}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const trimmedQuery = searchQuery.trim();

  const availableOptions = useMemo(() => options.filter(option => !isSelected(value, option)), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) {
      return availableOptions;
    }
    const normalizedQuery = normalizeName(trimmedQuery);
    return availableOptions.filter(option => normalizeName(option.name).includes(normalizedQuery));
  }, [availableOptions, trimmedQuery]);

  const showCreateSuggestion = useMemo(() => {
    if (!onCreateNew || !trimmedQuery) {
      return false;
    }
    const normalizedQuery = normalizeName(trimmedQuery);
    return !options.some(option => normalizeName(option.name) === normalizedQuery);
  }, [onCreateNew, options, trimmedQuery]);

  const suggestions: SuggestionItem[] = useMemo(() => {
    const items: SuggestionItem[] = [];
    if (showCreateSuggestion) {
      items.push({ type: 'create', name: trimmedQuery });
    }
    filteredOptions.forEach(option => items.push({ type: 'option', option }));
    return items;
  }, [filteredOptions, showCreateSuggestion, trimmedQuery]);

  const closeList = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const openList = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const addOption = useCallback(
    (option: IEntityComboboxItem) => {
      if (isSelected(value, option)) {
        return;
      }
      onChange([...value, option]);
      setSearchQuery('');
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  const removeOption = useCallback(
    (optionId: number) => {
      onChange(value.filter(item => item.id !== optionId));
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  const handleCreate = useCallback(() => {
    if (!onCreateNew || !trimmedQuery) {
      return;
    }
    onCreateNew(trimmedQuery);
    setSearchQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onCreateNew, trimmedQuery]);

  const selectHighlighted = useCallback(() => {
    if (highlightedIndex < 0 || highlightedIndex >= suggestions.length) {
      return;
    }
    const suggestion = suggestions[highlightedIndex];
    if (suggestion.type === 'create') {
      handleCreate();
    } else {
      addOption(suggestion.option);
    }
  }, [addOption, handleCreate, highlightedIndex, suggestions]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeList();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeList, isOpen]);

  useEffect(() => {
    if (highlightedIndex >= suggestions.length) {
      setHighlightedIndex(suggestions.length > 0 ? 0 : -1);
    }
  }, [highlightedIndex, suggestions.length]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openList();
          setHighlightedIndex(suggestions.length > 0 ? 0 : -1);
          return;
        }
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openList();
          setHighlightedIndex(suggestions.length > 0 ? suggestions.length - 1 : -1);
          return;
        }
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectHighlighted();
        } else if (showCreateSuggestion) {
          handleCreate();
        } else if (filteredOptions.length === 1) {
          addOption(filteredOptions[0]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeList();
        break;
      case 'Backspace':
        if (!searchQuery && value.length > 0) {
          onChange(value.slice(0, -1));
        }
        break;
      default:
        break;
    }
  };

  const resolvedPlaceholder = placeholder ?? translate('processComposerApp.sharedUi.entityCombobox.placeholder', 'Search or select...');

  return (
    <div ref={rootRef} className={`entity-combobox-creatable ${className ?? ''}`.trim()} data-cy={dataCy}>
      <div
        className={`entity-combobox-creatable__control ${disabled ? 'entity-combobox-creatable__control--disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
            openList();
          }
        }}
      >
        <div className="entity-combobox-creatable__chips">
          {value.map(item => (
            <Badge key={item.id} color="primary" pill className="entity-combobox-creatable__chip">
              <span className="entity-combobox-creatable__chip-label">{item.name}</span>
              {!disabled && (
                <button
                  type="button"
                  className="entity-combobox-creatable__chip-remove"
                  aria-label={translate('processComposerApp.sharedUi.entityCombobox.removeItem', {
                    name: item.name,
                    defaultValue: `Remove ${item.name}`,
                  })}
                  onClick={event => {
                    event.stopPropagation();
                    removeOption(item.id);
                  }}
                >
                  <FontAwesomeIcon icon="times-circle" />
                </button>
              )}
            </Badge>
          ))}
          <Input
            innerRef={inputRef}
            id={comboboxId}
            type="text"
            className="entity-combobox-creatable__input"
            value={searchQuery}
            disabled={disabled}
            placeholder={value.length === 0 ? resolvedPlaceholder : undefined}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
            onChange={event => {
              setSearchQuery(event.target.value);
              openList();
              setHighlightedIndex(-1);
            }}
            onFocus={openList}
            onKeyDown={handleInputKeyDown}
          />
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul id={listboxId} className="entity-combobox-creatable__suggestions" role="listbox">
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;

            if (suggestion.type === 'create') {
              return (
                <li
                  key={`create-${suggestion.name}`}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`entity-combobox-creatable__suggestion entity-combobox-creatable__suggestion--create ${
                    isHighlighted ? 'entity-combobox-creatable__suggestion--highlighted' : ''
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => handleCreate()}
                >
                  {translate('processComposerApp.sharedUi.entityCombobox.create', {
                    name: suggestion.name,
                    defaultValue: `+ Create '${suggestion.name}'`,
                  })}
                </li>
              );
            }

            return (
              <li
                key={suggestion.option.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isHighlighted}
                className={`entity-combobox-creatable__suggestion ${
                  isHighlighted ? 'entity-combobox-creatable__suggestion--highlighted' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={event => event.preventDefault()}
                onClick={() => addOption(suggestion.option)}
              >
                {suggestion.option.name}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && suggestions.length === 0 && trimmedQuery && (
        <div className="entity-combobox-creatable__empty">
          {translate('processComposerApp.sharedUi.entityCombobox.noResults', 'No matching options')}
        </div>
      )}
    </div>
  );
};

export default EntityComboboxCreatable;
