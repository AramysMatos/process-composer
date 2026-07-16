import './yaml-syntax-viewer.scss';

import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface YamlSyntaxViewerProps {
  value: string;
  'data-cy'?: string;
}

export const YamlSyntaxViewer = ({ value, 'data-cy': dataCy = 'yaml-syntax-viewer' }: YamlSyntaxViewerProps) => (
  <div className="yaml-syntax-viewer" data-cy={dataCy}>
    <SyntaxHighlighter
      language="yaml"
      style={docco}
      customStyle={{
        margin: 0,
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
      showLineNumbers
      wrapLongLines
    >
      {value}
    </SyntaxHighlighter>
  </div>
);

export default YamlSyntaxViewer;
