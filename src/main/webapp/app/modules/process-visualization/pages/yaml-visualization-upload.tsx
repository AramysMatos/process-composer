import '../process-visualization.scss';

import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, CardBody, Input, Label } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import ProcessComposerLogoIcon from 'app/shared/icons/process-composer-logo-icon';
import { parseProcessYaml } from 'app/modules/process-visualization/parse-process-yaml';
import { saveYamlSnapshotToSession } from 'app/modules/process-visualization/process-visualization-yaml-storage';
import { YAML_VISUALIZATION_BASE_PATH } from 'app/modules/process-visualization/process-visualization-paths';

export const YamlVisualizationUploadPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const openSnapshot = useCallback(
    (yamlText: string, name?: string) => {
      try {
        const snapshot = parseProcessYaml(yamlText);
        saveYamlSnapshotToSession(snapshot);
        setError(null);
        setFileName(name ?? null);
        navigate(YAML_VISUALIZATION_BASE_PATH);
      } catch {
        setError(translate('processComposerApp.processDesign.visualization.yaml.parseError', 'Could not read this YAML file.'));
      }
    },
    [navigate]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        openSnapshot(reader.result, file.name);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handlePasteOpen = () => {
    const pasted = window.prompt(
      translate('processComposerApp.processDesign.visualization.yaml.pastePrompt', 'Paste the process YAML content:')
    );
    if (pasted?.trim()) {
      openSnapshot(pasted.trim());
    }
  };

  return (
    <div className="process-visualization-site process-visualization-yaml-upload" data-cy="yaml-visualization-upload">
      <header className="process-visualization-site__header">
        <Link to="/" className="process-visualization-site__brand">
          <ProcessComposerLogoIcon width={28} height={28} />
          <span>ModusComposer</span>
        </Link>
      </header>
      <main className="process-visualization-yaml-upload__main">
        <Card className="process-visualization-yaml-upload__card shadow-sm border-0">
          <CardBody className="p-4">
            <h1 className="h4 mb-2">
              <Translate contentKey="processComposerApp.processDesign.visualization.yaml.uploadTitle">Open process from YAML</Translate>
            </h1>
            <p className="text-muted mb-4">
              <Translate contentKey="processComposerApp.processDesign.visualization.yaml.uploadSubtitle">
                Upload a process definition exported from ModusComposer to browse the read-only visualization site.
              </Translate>
            </p>

            {error && (
              <Alert color="danger" className="mb-3">
                {error}
              </Alert>
            )}

            {fileName && !error && (
              <Alert color="success" className="mb-3">
                <Translate contentKey="processComposerApp.processDesign.visualization.yaml.openingFile" interpolate={{ name: fileName }} />
              </Alert>
            )}

            <div className="mb-3">
              <Label for="yaml-upload-input" className="form-label">
                <Translate contentKey="processComposerApp.processDesign.visualization.yaml.fileLabel">YAML file</Translate>
              </Label>
              <Input
                id="yaml-upload-input"
                className="process-visualization-yaml-upload__file-input"
                type="file"
                accept=".yaml,.yml,text/yaml"
                onChange={handleFileChange}
                data-cy="yaml-upload-input"
              />
            </div>

            <Button color="secondary" outline onClick={handlePasteOpen} data-cy="yaml-paste-button" block>
              <FontAwesomeIcon icon="copy" className="me-2" />
              <Translate contentKey="processComposerApp.processDesign.visualization.yaml.pasteButton">Paste YAML</Translate>
            </Button>

            <p className="text-muted small text-center mt-4 mb-0">
              <Link to="/processos">
                <Translate contentKey="processComposerApp.processDesign.visualization.backToProcesses">Back to processes</Translate>
              </Link>
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default YamlVisualizationUploadPage;
