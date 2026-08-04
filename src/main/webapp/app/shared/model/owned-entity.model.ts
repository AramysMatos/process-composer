export interface IOwnedEntity {
  ownerId?: number | null;
  systemTemplate?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
}

export const isSystemTemplate = (entity: Pick<IOwnedEntity, 'ownerId'> | null | undefined): boolean =>
  entity != null && (entity.ownerId === null || entity.ownerId === undefined);

export const canEditEntity = (
  entity: Pick<IOwnedEntity, 'ownerId'> | null | undefined,
  isAdmin: boolean,
  currentUserId?: number
): boolean => {
  if (!entity) {
    return false;
  }
  if (isAdmin) {
    return true;
  }
  if (isSystemTemplate(entity)) {
    return false;
  }
  return currentUserId != null && entity.ownerId === currentUserId;
};
