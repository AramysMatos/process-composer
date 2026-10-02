import './searchable-source-list-picker.scss';

import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input, InputGroup, InputGroupText, Label, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

export interface SearchableSourceListItem {
  id?: number;
  name?: string | null;
}

export interface SearchableSourceListPickerProps {
  items: SearchableSourceListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  dataCyPrefix: string;
  listLabelContentKey?: string;
  listLabelDefault?: string;
  emptyContentKey?: string;
  emptyDefault?: string;
  loadingContentKey?: string;
  loadingDefault?: string;
}

export const SearchableSourceListPicker = ({
  items,
  selectedId,
  onSelect,
  loading = false,
  dataCyPrefix,
  listLabelContentKey = 'processComposerApp.processDesign.canvas.cloneSourceLabel',
  listLabelDefault = 'Source',
  emptyContentKey = 'processComposerApp.processDesign.canvas.cloneSourceEmpty',
  emptyDefault = 'No items found',
  loadingContentKey = 'processComposerApp.processDesign.canvas.cloneLoading',
  loadingDefault = 'Loading...',
}: SearchableSourceListPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const displayedItems = useMemo(() => {
    const sorted = [...items].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' }));
    if (!trimmedSearch) {
      return sorted;
    }
    return sorted.filter(item => (item.name ?? '').toLowerCase().includes(trimmedSearch));
  }, [items, trimmedSearch]);

  const searchPlaceholder = translate('processComposerApp.library.searchPlaceholder', 'Search by name...');

  return (
    <div className="searchable-source-list-picker" data-cy={`${dataCyPrefix}-picker`}>
      {listLabelContentKey && (
        <Label className="form-label mb-2">
          <Translate contentKey={listLabelContentKey}>{listLabelDefault}</Translate>
        </Label>
      )}
      <div className="searchable-source-list-picker__search">
        <InputGroup>
          <InputGroupText>
            <FontAwesomeIcon icon="search" />
          </InputGroupText>
          <Input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={loading}
            data-cy={`${dataCyPrefix}-search`}
          />
        </InputGroup>
      </div>
      {loading ? (
        <div className="searchable-source-list-picker__loading" data-cy={`${dataCyPrefix}-loading`}>
          <Spinner size="sm" color="primary" /> <Translate contentKey={loadingContentKey}>{loadingDefault}</Translate>
        </div>
      ) : displayedItems.length === 0 ? (
        <p className="searchable-source-list-picker__empty" data-cy={`${dataCyPrefix}-empty`}>
          <Translate contentKey={emptyContentKey}>{emptyDefault}</Translate>
        </p>
      ) : (
        <div className="searchable-source-list-picker__list" role="listbox" data-cy={`${dataCyPrefix}-list`}>
          {displayedItems.map(item => {
            const itemId = item.id?.toString() ?? '';
            const isSelected = selectedId === itemId;
            return (
              <button
                key={itemId}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`searchable-source-list-picker__list-item${
                  isSelected ? ' searchable-source-list-picker__list-item--selected' : ''
                }`}
                onClick={() => onSelect(itemId)}
                data-cy={`${dataCyPrefix}-listItem-${itemId}`}
              >
                <span className="searchable-source-list-picker__list-item-indicator" aria-hidden="true" />
                <span className="searchable-source-list-picker__list-item-name">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchableSourceListPicker;
