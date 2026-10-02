package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Activity;
import com.mycompany.myapp.domain.Phase;
import com.mycompany.myapp.domain.Process;
import com.mycompany.myapp.repository.ActivityRepository;
import com.mycompany.myapp.repository.PhaseRepository;
import com.mycompany.myapp.repository.ProcessRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProcessSystemTemplateService {

    private final ProcessRepository processRepository;
    private final PhaseRepository phaseRepository;
    private final ActivityRepository activityRepository;
    private final EntityAccessService entityAccessService;

    public ProcessSystemTemplateService(
        ProcessRepository processRepository,
        PhaseRepository phaseRepository,
        ActivityRepository activityRepository,
        EntityAccessService entityAccessService
    ) {
        this.processRepository = processRepository;
        this.phaseRepository = phaseRepository;
        this.activityRepository = activityRepository;
        this.entityAccessService = entityAccessService;
    }

    @Transactional
    public Process promoteToSystemTemplate(Long processId) {
        if (!entityAccessService.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can promote processes to system templates");
        }

        Process process = processRepository
            .findById(processId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Process not found"));

        if (process.isSystemTemplate()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Process is already a system template");
        }

        Long currentUserId = entityAccessService.getCurrentUserId();
        if (!Objects.equals(process.getOwnerId(), currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only processes you own can be promoted to system templates");
        }

        process.setOwner(null);
        processRepository.save(process);

        List<Phase> phases = phaseRepository.findByProcess_Id(processId);
        for (Phase phase : phases) {
            phase.setOwner(null);
        }
        phaseRepository.saveAll(phases);

        List<Activity> activities = activityRepository.findByPhase_Process_Id(processId);
        for (Activity activity : activities) {
            activity.setOwner(null);
        }
        activityRepository.saveAll(activities);

        return process;
    }
}
