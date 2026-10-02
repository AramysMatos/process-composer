import { IUser } from 'app/shared/model/user.model';

export interface IOwnedEntity {
  ownerId?: number | null;
  owner?: Pick<IUser, 'id' | 'login'> | null;
  systemTemplate?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
}

export type OwnedEntityRef = Pick<IOwnedEntity, 'ownerId' | 'owner'> | null | undefined;

export const getEntityOwnerId = (entity: OwnedEntityRef): number | null | undefined => {
  if (entity == null) {
    return undefined;
  }
  if (entity.ownerId !== undefined) {
    return entity.ownerId;
  }
  if (entity.owner === null) {
    return null;
  }
  if (entity.owner?.id != null) {
    return Number(entity.owner.id);
  }
  return undefined;
};

export const isSystemTemplate = (entity: OwnedEntityRef): boolean => getEntityOwnerId(entity) === null;

export const canEditEntity = (entity: OwnedEntityRef, isAdmin: boolean, currentUserId?: number): boolean => {
  if (!entity) {
    return false;
  }
  if (isAdmin) {
    return true;
  }
  const ownerId = getEntityOwnerId(entity);
  if (ownerId === null) {
    return false;
  }
  if (ownerId === undefined) {
    return false;
  }
  return currentUserId != null && ownerId === currentUserId;
};
