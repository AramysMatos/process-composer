import JSZip from 'jszip';

import { buildStaticProcessSiteFiles } from 'app/modules/process-visualization/build-static-process-site';
import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';

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

  zip.file('process.yaml', yamlContent);
  zip.file('process-snapshot.json', JSON.stringify(snapshot, null, 2));

  const siteFiles = buildStaticProcessSiteFiles(snapshot);
  siteFiles.forEach((content, path) => {
    zip.file(path, content);
  });

  zip.file(
    'README.txt',
    [
      'ModusComposer — site estático do processo',
      '',
      'Abra index.html no navegador (funciona offline com file://).',
      '',
      'Estrutura:',
      '  index.html              — visão geral',
      '  activities/index.html   — lista de atividades',
      '  activities/*.html       — ficha de cada atividade',
      '  roles|tools|guidelines|artifacts|templates/',
      '      index.html          — lista do catálogo',
      '      *.html              — detalhe de cada item',
      '  assets/site.css         — estilos compartilhados',
      '  process.yaml            — definição exportada',
      '',
      'Para canvas e experiência completa, importe process.yaml no ModusComposer',
      '(Processos → Visualizar a partir de YAML).',
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
