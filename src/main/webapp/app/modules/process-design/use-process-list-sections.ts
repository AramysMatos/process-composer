import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { buildListRequestUrl } from 'app/entities/process/process-list-request';
import { IProcess } from 'app/shared/model/process.model';

export const MODEL_SECTION_FETCH_SIZE = 500;

type SectionState = {
  items: IProcess[];
  totalItems: number;
  loading: boolean;
};

const emptySection = (): SectionState => ({
  items: [],
  totalItems: 0,
  loading: false,
});

const parseTotalCount = (headers: Record<string, string | undefined>): number => {
  const raw = headers['x-total-count'];
  if (raw === undefined) {
    return 0;
  }
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const fetchProcessPage = async (query: Parameters<typeof buildListRequestUrl>[0]): Promise<{ items: IProcess[]; totalItems: number }> => {
  const response = await axios.get<IProcess[]>(buildListRequestUrl(query));
  return {
    items: response.data,
    totalItems: parseTotalCount(response.headers as Record<string, string | undefined>),
  };
};

export type ProcessListSectionsParams = {
  enabled: boolean;
  currentUserId?: number;
  includeOthersSection: boolean;
  myPage: number;
  othersPage: number;
  pageSize: number;
  serverSort: string;
  myNeedsLargeFetch: boolean;
  othersNeedsLargeFetch: boolean;
  largeFetchSize: number;
};

export type ProcessListSectionsResult = {
  my: SectionState;
  models: SectionState;
  others: SectionState;
  loading: boolean;
  refresh: () => void;
};

export const useProcessListSections = ({
  enabled,
  currentUserId,
  includeOthersSection,
  myPage,
  othersPage,
  pageSize,
  serverSort,
  myNeedsLargeFetch,
  othersNeedsLargeFetch,
  largeFetchSize,
}: ProcessListSectionsParams): ProcessListSectionsResult => {
  const [my, setMy] = useState<SectionState>(emptySection);
  const [models, setModels] = useState<SectionState>(emptySection);
  const [others, setOthers] = useState<SectionState>(emptySection);
  const [refreshGeneration, setRefreshGeneration] = useState(0);

  const refresh = useCallback(() => {
    setRefreshGeneration(current => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || currentUserId == null) {
      setMy(emptySection());
      setModels(emptySection());
      setOthers(emptySection());
      return;
    }

    let cancelled = false;

    const load = async () => {
      setMy(current => ({ ...current, loading: true }));
      setModels(current => ({ ...current, loading: true }));
      if (includeOthersSection) {
        setOthers(current => ({ ...current, loading: true }));
      } else {
        setOthers(emptySection());
      }

      try {
        const myQuery = myNeedsLargeFetch
          ? { page: 0, size: largeFetchSize, sort: serverSort, ownerId: currentUserId }
          : { page: myPage - 1, size: pageSize, sort: serverSort, ownerId: currentUserId };

        const modelsQuery = { page: 0, size: MODEL_SECTION_FETCH_SIZE, sort: serverSort, systemOnly: true as const };

        const promises: [Promise<{ items: IProcess[]; totalItems: number }>, Promise<{ items: IProcess[]; totalItems: number }>] = [
          fetchProcessPage(myQuery),
          fetchProcessPage(modelsQuery),
        ];

        let othersPromise: Promise<{ items: IProcess[]; totalItems: number }> | undefined;
        if (includeOthersSection) {
          const othersQuery = othersNeedsLargeFetch
            ? { page: 0, size: largeFetchSize, sort: serverSort, othersOnly: true as const }
            : { page: othersPage - 1, size: pageSize, sort: serverSort, othersOnly: true as const };
          othersPromise = fetchProcessPage(othersQuery);
        }

        const [myResult, modelsResult] = await Promise.all(promises);
        const othersResult = othersPromise ? await othersPromise : null;

        if (cancelled) {
          return;
        }

        setMy({ items: myResult.items, totalItems: myResult.totalItems, loading: false });
        setModels({ items: modelsResult.items, totalItems: modelsResult.totalItems, loading: false });
        if (othersResult) {
          setOthers({ items: othersResult.items, totalItems: othersResult.totalItems, loading: false });
        }
      } catch {
        if (cancelled) {
          return;
        }
        setMy(current => ({ ...current, loading: false }));
        setModels(current => ({ ...current, loading: false }));
        setOthers(current => ({ ...current, loading: false }));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    currentUserId,
    enabled,
    includeOthersSection,
    largeFetchSize,
    myNeedsLargeFetch,
    myPage,
    othersNeedsLargeFetch,
    othersPage,
    pageSize,
    refreshGeneration,
    serverSort,
  ]);

  const loading = my.loading || models.loading || (includeOthersSection && others.loading);

  return { my, models, others, loading, refresh };
};
