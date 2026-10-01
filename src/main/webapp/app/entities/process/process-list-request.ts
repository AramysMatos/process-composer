export interface IProcessQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  ownerId?: number;
  systemOnly?: boolean;
  othersOnly?: boolean;
}

export const buildListRequestUrl = ({ page, size, sort, ownerId, systemOnly, othersOnly }: IProcessQueryParams): string => {
  const params = new URLSearchParams();
  if (page !== undefined) {
    params.set('page', String(page));
  }
  if (size !== undefined) {
    params.set('size', String(size));
  }
  if (sort) {
    params.set('sort', sort);
  }
  if (ownerId !== undefined) {
    params.set('ownerId', String(ownerId));
  }
  if (systemOnly) {
    params.set('systemOnly', 'true');
  }
  if (othersOnly) {
    params.set('othersOnly', 'true');
  }
  params.set('cacheBuster', String(new Date().getTime()));
  return `api/processes?${params.toString()}`;
};
