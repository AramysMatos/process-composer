import { canEditEntity } from 'app/shared/model/owned-entity.model';
import { IProcess } from 'app/shared/model/process.model';

export const isProcessReadOnlyForUser = (
  process: Pick<IProcess, 'ownerId'> | null | undefined,
  isAdmin: boolean,
  currentUserId?: number
): boolean => !canEditEntity(process, isAdmin, currentUserId);
