import './library-master-detail.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { LibraryEntityBase, LibraryEntityConfig } from 'app/modules/library/library.config';
import { UsedInActivitiesList } from 'app/modules/library/components/used-in-activities-list';

const LIST_PAGE_SIZE = 20;
const NEW_ITEM_ID = 'new';

interface LibraryMasterDetailProps<T extends LibraryEntityBase> {
  config: LibraryEntityConfig<T>;
  selectedId?: string;
  onSelectItem: (id: number | typeof NEW_ITEM_ID | undefined) => void;
}

export const LibraryMasterDetail = <T extends LibraryEntityBase>({ config, selectedId, onSelectItem }: LibraryMasterDetailProps<T>) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [draft, setDraft] = useState<T>(config.defaultValue as T);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const entities = useAppSelector(state => state[config.sliceKey].entities) as T[];
  const entity = useAppSelector(state => state[config.sliceKey].entity) as T;
  const loading = useAppSelector(state => state[config.sliceKey].loading);
  const updating = useAppSelector(state => state[config.sliceKey].updating);
  const updateSuccess = useAppSelector(state => state[config.sliceKey].updateSuccess);

  const isCreating = selectedId === NEW_ITEM_ID;
  const selectedNumericId = selectedId && selectedId !== NEW_ITEM_ID ? Number(selectedId) : undefined;
  const hasValidSelection = isCreating || (selectedNumericId !== undefined && !Number.isNaN(selectedNumericId));

  const trimmedSearch = searchQuery.trim().toLowerCase();

  useEffect(() => {
    dispatch(config.thunks.getEntities({}));
  }, [config.sliceKey, dispatch]);

  useEffect(() => {
    setActivePage(1);
  }, [trimmedSearch, config.sliceKey]);

  useEffect(() => {
    if (isCreating) {
      dispatch(config.thunks.reset());
      setDraft(config.defaultValue as T);
      return;
    }

    if (selectedNumericId !== undefined && !Number.isNaN(selectedNumericId)) {
      dispatch(config.thunks.getEntity(selectedNumericId));
    }
  }, [config.sliceKey, dispatch, isCreating, selectedNumericId]);

  useEffect(() => {
    if (!isCreating && entity?.id && selectedNumericId === entity.id) {
      setDraft(entity);
    }
  }, [entity, isCreating, selectedNumericId]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    if (deleteModalOpen) {
      setDeleteModalOpen(false);
      onSelectItem(undefined);
      navigate(`/biblioteca/${config.type}`);
      return;
    }

    if (isCreating && entity?.id) {
      onSelectItem(entity.id);
      navigate(`/biblioteca/${config.type}/${entity.id}`);
    }
  }, [config.type, deleteModalOpen, entity?.id, isCreating, navigate, onSelectItem, updateSuccess]);

  const filteredEntities = useMemo(() => {
    if (!trimmedSearch) {
      return entities;
    }

    return entities.filter(item => {
      const name = item.name?.toLowerCase() ?? '';
      const description = item.description?.toLowerCase() ?? '';
      return name.includes(trimmedSearch) || description.includes(trimmedSearch);
    });
  }, [entities, trimmedSearch]);

  const displayedEntities = useMemo(() => {
    const start = (activePage - 1) * LIST_PAGE_SIZE;
    return filteredEntities.slice(start, start + LIST_PAGE_SIZE);
  }, [activePage, filteredEntities]);

  const detailEntity = isCreating ? draft : entity?.id === selectedNumericId ? entity : draft;
  const activityRefs = useMemo(() => config.extractActivityRefs(detailEntity), [config, detailEntity]);
  const usedInCount = useMemo(() => {
    const uniqueIds = new Set<number>();
    activityRefs.forEach(ref => {
      if (ref.activity.id) {
        uniqueIds.add(ref.activity.id);
      }
    });
    return uniqueIds.size;
  }, [activityRefs]);

  const handleFieldChange = (field: keyof T, value: string | boolean) => {
    setDraft(current => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = event => {
    event.preventDefault();

    const payload = {
      ...detailEntity,
      ...draft,
    } as T;

    if (isCreating) {
      dispatch(config.thunks.createEntity(payload));
      return;
    }

    dispatch(config.thunks.updateEntity(payload));
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (detailEntity.id) {
      dispatch(config.thunks.deleteEntity(detailEntity.id));
    }
  };

  return (
    <div className="library-master-detail" data-cy={`libraryMasterDetail-${config.type}`}>
      <section className="library-master-detail__master" aria-label={translate('processComposerApp.library.masterList', 'Master list')}>
        <div className="library-master-detail__master-header">
          <InputGroup>
            <InputGroupText>
              <FontAwesomeIcon icon="search" />
            </InputGroupText>
            <Input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
              aria-label={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
              data-cy="librarySearchInput"
            />
          </InputGroup>
          <Button color="primary" size="sm" onClick={() => onSelectItem(NEW_ITEM_ID)} data-cy="libraryCreateButton">
            <FontAwesomeIcon icon="plus" /> <Translate contentKey="processComposerApp.library.createLabel">New item</Translate>
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" size="sm" />
          </div>
        )}

        {!loading && filteredEntities.length === 0 && (
          <div className="alert alert-warning m-3 mb-0" data-cy="libraryListEmpty">
            <Translate contentKey="processComposerApp.library.notFound">No items found</Translate>
          </div>
        )}

        {!loading && displayedEntities.length > 0 && (
          <div className="library-master-detail__list" data-cy="libraryMasterList">
            {displayedEntities.map(item => {
              const isSelected = item.id === selectedNumericId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`library-master-detail__list-item${isSelected ? ' library-master-detail__list-item--selected' : ''}`}
                  onClick={() => item.id && onSelectItem(item.id)}
                  data-cy={`libraryListItem-${item.id}`}
                >
                  <span className="library-master-detail__list-item-name">{item.name}</span>
                  {item.description && <span className="library-master-detail__list-item-description">{item.description}</span>}
                </button>
              );
            })}
          </div>
        )}

        {!loading && filteredEntities.length > LIST_PAGE_SIZE && (
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <JhiItemCount page={activePage} total={filteredEntities.length} itemsPerPage={LIST_PAGE_SIZE} i18nEnabled />
              <JhiPagination
                activePage={activePage}
                onSelect={setActivePage}
                maxButtons={5}
                itemsPerPage={LIST_PAGE_SIZE}
                totalItems={filteredEntities.length}
              />
            </div>
          </div>
        )}
      </section>

      <section className="library-master-detail__detail" aria-label={translate('processComposerApp.library.detailPanel', 'Detail panel')}>
        {!hasValidSelection ? (
          <div className="library-master-detail__detail-empty" data-cy="libraryDetailEmpty">
            <Translate contentKey="processComposerApp.library.selectItem">Select an item from the list or create a new one</Translate>
          </div>
        ) : (
          <div className="library-master-detail__detail-body">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
              <h2 className="h4 mb-0">
                {isCreating ? <Translate contentKey="processComposerApp.library.createTitle">New item</Translate> : detailEntity.name}
              </h2>
              {!isCreating && detailEntity.id && (
                <Button color="danger" outline size="sm" onClick={openDeleteModal} data-cy="libraryDeleteButton">
                  <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
                </Button>
              )}
            </div>

            {(loading || updating) && !isCreating && (
              <div className="text-center py-3">
                <Spinner color="primary" size="sm" />
              </div>
            )}

            <Form onSubmit={handleSave}>
              <FormGroup>
                <Label for={`library-${config.type}-name`}>
                  <Translate contentKey={`processComposerApp.${config.type}.name`}>Name</Translate>
                </Label>
                <Input
                  id={`library-${config.type}-name`}
                  name="name"
                  value={draft.name ?? ''}
                  onChange={event => handleFieldChange('name', event.target.value)}
                  required
                  data-cy="libraryNameInput"
                />
              </FormGroup>

              <FormGroup>
                <Label for={`library-${config.type}-description`}>
                  <Translate contentKey={`processComposerApp.${config.type}.description`}>Description</Translate>
                </Label>
                <Input
                  id={`library-${config.type}-description`}
                  name="description"
                  type="textarea"
                  rows={3}
                  value={draft.description ?? ''}
                  onChange={event => handleFieldChange('description', event.target.value)}
                  data-cy="libraryDescriptionInput"
                />
              </FormGroup>

              {config.showOptional && (
                <FormGroup check className="mb-3">
                  <Input
                    id={`library-${config.type}-optional`}
                    name="optional"
                    type="checkbox"
                    checked={Boolean(draft.optional)}
                    onChange={event => handleFieldChange('optional', event.target.checked)}
                    data-cy="libraryOptionalInput"
                  />
                  <Label check for={`library-${config.type}-optional`}>
                    <Translate contentKey="processComposerApp.artifacts.optional">Optional</Translate>
                  </Label>
                </FormGroup>
              )}

              <Button color="primary" type="submit" disabled={updating || !draft.name?.trim()} data-cy="librarySaveButton">
                <FontAwesomeIcon icon="save" spin={updating} /> <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </Form>

            {!isCreating && (
              <div className="library-master-detail__used-in">
                <h3 className="h6 mb-3">
                  <Translate contentKey="processComposerApp.library.usedIn.title">Used in activities</Translate>
                </h3>
                <UsedInActivitiesList activityRefs={activityRefs} />
              </div>
            )}
          </div>
        )}
      </section>

      <Modal isOpen={deleteModalOpen} toggle={closeDeleteModal}>
        <ModalHeader toggle={closeDeleteModal} data-cy="libraryDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          {usedInCount > 0 ? (
            <Alert color="warning" className="mb-0" data-cy="libraryDeleteUsedWarning">
              <Translate contentKey="processComposerApp.library.delete.usedWarning" interpolate={{ count: usedInCount }}>
                {`Used in ${usedInCount} activities — remove anyway?`}
              </Translate>
            </Alert>
          ) : (
            <Translate contentKey="processComposerApp.library.delete.confirm" interpolate={{ name: detailEntity.name ?? '' }}>
              Are you sure you want to delete this item?
            </Translate>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeDeleteModal}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={updating} data-cy="libraryConfirmDeleteButton">
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LibraryMasterDetail;
