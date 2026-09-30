import JSZip from 'jszip';

import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import { buildStaticProcessSiteHtml } from 'app/modules/process-visualization/generate-static-process-site-html';

const slugifyFileName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'process';

export const generateProcessSiteZip = async (yamlContent: string, snapshot: ProcessSnapshot): Promise<Blob> => {
  const zip = new JSZip();
  const baseName = slugifyFileName(snapshot.processName || 'process');

  zip.file('process.yaml', yamlContent);
  zip.file('process-snapshot.json', JSON.stringify(snapshot, null, 2));
  zip.file('index.html', buildStaticProcessSiteHtml(snapshot));
  zip.file(
    'README.txt',
    [
      'ModusComposer — site estático do processo',
      '',
      'index.html — visão geral offline (dados embutidos).',
      'process.yaml — definição exportada.',
      '',
      'Para a experiência completa (canvas, catálogos), abra process.yaml em ModusComposer:',
      'Visualizar YAML (/visualizar-yaml/upload) ou use "Abrir site de visualização" na exportação.',
      '',
    ].join('\n')
  );

  return zip.generateAsync({ type: 'blob' });
};

export const downloadProcessSiteZip = async (yamlContent: string, snapshot: ProcessSnapshot): Promise<void> => {
  const blob = await generateProcessSiteZip(yamlContent, snapshot);
  const baseName = slugifyFileName(snapshot.processName || 'process');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseName}-site.zip`;
  link.click();
  URL.revokeObjectURL(url);
};
