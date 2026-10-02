import { canEditEntity, getEntityOwnerId, isSystemTemplate } from './owned-entity.model';

describe('owned-entity helpers', () => {
  it('resolves owner id from ownerId or nested owner', () => {
    expect(getEntityOwnerId({ ownerId: 1 })).toBe(1);
    expect(getEntityOwnerId({ owner: { id: 2 } })).toBe(2);
    expect(getEntityOwnerId({ ownerId: null })).toBe(null);
    expect(getEntityOwnerId({})).toBeUndefined();
  });

  it('detects system templates only when owner is explicitly null', () => {
    expect(isSystemTemplate({ ownerId: null })).toBe(true);
    expect(isSystemTemplate({ owner: null })).toBe(true);
    expect(isSystemTemplate({ ownerId: undefined })).toBe(false);
    expect(isSystemTemplate({})).toBe(false);
    expect(isSystemTemplate({ ownerId: 1 })).toBe(false);
  });

  it('allows admin to edit any entity', () => {
    expect(canEditEntity({ ownerId: null }, true, 1)).toBe(true);
    expect(canEditEntity({ ownerId: 2 }, true, 1)).toBe(true);
  });

  it('blocks user from editing system templates', () => {
    expect(canEditEntity({ ownerId: null }, false, 1)).toBe(false);
  });

  it('blocks user when owner is unknown', () => {
    expect(canEditEntity({}, false, 1)).toBe(false);
  });

  it('allows user to edit own entities', () => {
    expect(canEditEntity({ ownerId: 1 }, false, 1)).toBe(true);
    expect(canEditEntity({ ownerId: 2 }, false, 1)).toBe(false);
  });
});
