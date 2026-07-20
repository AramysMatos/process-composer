import { z } from 'zod';

export const phaseDraftSchema = z.object({
  name: z.string().trim().min(1, 'processComposerApp.processDesign.wizard.validation.phaseNameRequired'),
  description: z.string().optional(),
});

const phaseDraftLenientSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const processWizardBaseSchema = z.object({
  processName: z.string().trim().min(1, 'processComposerApp.processDesign.wizard.validation.processNameRequired'),
  processDescription: z.string().optional(),
  creationMode: z.enum(['blank', 'fromProcess']),
  sourceProcessId: z.number().optional(),
  selectedActivityIds: z.array(z.number()),
  selectedEmptyPhaseIds: z.array(z.number()),
  phases: z.array(phaseDraftLenientSchema),
});

const validateBlankPhases = (phases: z.infer<typeof phaseDraftLenientSchema>[], ctx: z.RefinementCtx) => {
  if (phases.length < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'processComposerApp.processDesign.wizard.validation.atLeastOnePhase',
      path: ['phases'],
    });
    return;
  }

  phases.forEach((phase, index) => {
    const result = phaseDraftSchema.safeParse(phase);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          ...issue,
          path: ['phases', index, ...(issue.path ?? [])],
        });
      });
    }
  });
};

const validateProcessWizardByMode = (data: z.infer<typeof processWizardBaseSchema>, ctx: z.RefinementCtx) => {
  if (data.creationMode === 'blank') {
    validateBlankPhases(data.phases, ctx);
    return;
  }

  if (!Number.isFinite(data.sourceProcessId) || (data.sourceProcessId ?? 0) <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'processComposerApp.processDesign.wizard.validation.sourceProcessRequired',
      path: ['sourceProcessId'],
    });
  }

  if (data.selectedActivityIds.length === 0 && data.selectedEmptyPhaseIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'processComposerApp.processDesign.wizard.validation.atLeastOneItemToClone',
      path: ['selectedActivityIds'],
    });
  }
};

export const processWizardStep2Schema = processWizardBaseSchema
  .pick({
    creationMode: true,
    phases: true,
    sourceProcessId: true,
    selectedActivityIds: true,
    selectedEmptyPhaseIds: true,
  })
  .superRefine((data, ctx) => {
    validateProcessWizardByMode(data, ctx);
  });

export const processWizardSchema = processWizardBaseSchema.superRefine((data, ctx) => {
  validateProcessWizardByMode(data, ctx);
});

export const processWizardStep1Schema = z.object({
  processName: z.string().trim().min(1, 'processComposerApp.processDesign.wizard.validation.processNameRequired'),
  processDescription: z.string().optional(),
});

export type ProcessWizardFormValues = z.infer<typeof processWizardSchema>;
