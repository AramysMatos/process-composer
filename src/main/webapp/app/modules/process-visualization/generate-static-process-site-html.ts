import { buildStaticProcessSiteFiles } from 'app/modules/process-visualization/build-static-process-site';
import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';

/** @deprecated Prefer buildStaticProcessSiteFiles for multipage export. */
export const buildStaticProcessSiteHtml = (snapshot: ProcessSnapshot): string =>
  buildStaticProcessSiteFiles(snapshot).get('index.html') ?? '';

export { buildStaticProcessSiteFiles } from 'app/modules/process-visualization/build-static-process-site';
