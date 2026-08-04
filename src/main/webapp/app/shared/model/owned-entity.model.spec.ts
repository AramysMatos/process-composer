import { canEditEntity, isSystemTemplate } from './owned-entity.model';

describe('owned-entity helpers', () => {
  it('detects system templates', () => {
    expect(isSystemTemplate({ ownerId: null })).toBe(true);
    expect(isSystemTemplate({ ownerId: undefined })).toBe(true);
    expect(isSystemTemplate({ ownerId: 1 })).toBe(false);
  });

  it('allows admin to edit any entity', () => {
    expect(canEditEntity({ ownerId: null }, true, 1)).toBe(true);
    expect(canEditEntity({ ownerId: 2 }, true, 1)).toBe(true);
  });

  it('blocks user from editing system templates', () => {
    expect(canEditEntity({ ownerId: null }, false, 1)).toBe(false);
  });

  it('allows user to edit own entities', () => {
    expect(canEditEntity({ ownerId: 1 }, false, 1)).toBe(true);
    expect(canEditEntity({ ownerId: 2 }, false, 1)).toBe(false);
  });
});
