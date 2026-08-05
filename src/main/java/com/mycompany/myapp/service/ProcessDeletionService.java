package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Phase;
import com.mycompany.myapp.domain.Process;
import com.mycompany.myapp.repository.PhaseRepository;
import com.mycompany.myapp.repository.ProcessRepository;
import com.mycompany.myapp.repository.ProjectRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles process deletion by removing dependent phases and activities first.
 */
@Service
@Transactional
public class ProcessDeletionService {

    private static final String ENTITY_NAME = "process";

    private final ProcessRepository processRepository;
    private final PhaseRepository phaseRepository;
    private final ProjectRepository projectRepository;
    private final ActivityDeletionService activityDeletionService;

    public ProcessDeletionService(
        ProcessRepository processRepository,
        PhaseRepository phaseRepository,
        ProjectRepository projectRepository,
        ActivityDeletionService activityDeletionService
    ) {
        this.processRepository = processRepository;
        this.phaseRepository = phaseRepository;
        this.projectRepository = projectRepository;
        this.activityDeletionService = activityDeletionService;
    }

    public void deleteProcess(Long id) {
        Process process = processRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(ENTITY_NAME));

        if (projectRepository.existsByProcess_Id(id)) {
            throw new InvalidOperationException("Process is linked to projects", ENTITY_NAME, "processhasprojects");
        }

        List<Phase> phases = phaseRepository.findByProcess_Id(id);
        for (Phase phase : phases) {
            activityDeletionService.deleteActivitiesByPhaseId(phase.getId());
            phaseRepository.delete(phase);
        }

        processRepository.delete(process);
    }
}
