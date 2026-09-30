const PROCESS_VISUALIZATION_PATH = /^\/processos\/\d+\/visualizar(\/.*)?$/;

export function isProcessVisualizationRoute(pathname: string): boolean {
  return PROCESS_VISUALIZATION_PATH.test(pathname);
}

export function parseProcessVisualizationProcessId(pathname: string): number | undefined {
  const match = pathname.match(/^\/processos\/(\d+)\/visualizar/);
  if (!match) {
    return undefined;
  }
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}
