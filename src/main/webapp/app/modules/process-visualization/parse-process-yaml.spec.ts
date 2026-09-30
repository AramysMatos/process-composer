import { parseProcessYaml } from './parse-process-yaml';

describe('parseProcessYaml', () => {
  it('parses minimal process document', () => {
    const yaml = `
process_name: My Process
process_description: Desc
phases:
  phase_1:
    name: Phase 1
    description: P desc
    activities:
      - act_a
activities:
  act_a:
    name: Activity A
    description: AD
    input_criterion: IC
    tools:
      - tool_1
tools:
  tool_1:
    name: Tool
    description: TD
roles: {}
guidelines: {}
templates: {}
artifacts: {}
`;
    const snapshot = parseProcessYaml(yaml);
    expect(snapshot.processName).toBe('My Process');
    expect(snapshot.phases).toHaveLength(1);
    expect(snapshot.activities).toHaveLength(1);
    expect(snapshot.activities[0].toolKeys).toEqual(['tool_1']);
    expect(snapshot.activities[0].phaseKey).toBe('phase_1');
    expect(snapshot.tools.tool_1.name).toBe('Tool');
  });
});
