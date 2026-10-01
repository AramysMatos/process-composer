package com.mycompany.myapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.mycompany.myapp.domain.Activity;
import com.mycompany.myapp.domain.Phase;
import com.mycompany.myapp.domain.Process;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.*;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReferenceAccessValidatorTest {

    @Mock
    private EntityAccessService entityAccessService;

    @Mock
    private RolesRepository rolesRepository;

    @Mock
    private ToolsRepository toolsRepository;

    @Mock
    private GuidelinesRepository guidelinesRepository;

    @Mock
    private ArtifactsRepository artifactsRepository;

    @Mock
    private TemplatesRepository templatesRepository;

    @Mock
    private ProcessRepository processRepository;

    @Mock
    private PhaseRepository phaseRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ReferenceAccessValidator referenceAccessValidator;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(2L);
        admin.setLogin("admin");
    }

    @Test
    void validatePhaseReferences_doesNotReassignOwnerOnUpdateOfSystemPhase() {
        Process systemProcess = new Process().id(10L);
        systemProcess.setOwner(null);

        Phase systemPhase = new Phase().id(20L).name("Sprint");
        systemPhase.setOwner(null);
        systemPhase.setProcess(systemProcess);

        when(processRepository.findById(10L)).thenReturn(Optional.of(systemProcess));

        referenceAccessValidator.validatePhaseReferences(systemPhase);

        assertThat(systemPhase.getOwner()).isNull();
    }

    @Test
    void validatePhaseReferences_adminCreateUnderSystemProcessStaysSystemTemplate() {
        Process systemProcess = new Process().id(10L);
        systemProcess.setOwner(null);

        Phase newPhase = new Phase().name("New Phase");
        newPhase.setProcess(systemProcess);

        when(processRepository.findById(10L)).thenReturn(Optional.of(systemProcess));
        when(entityAccessService.isAdmin()).thenReturn(true);

        referenceAccessValidator.validatePhaseReferences(newPhase);

        assertThat(newPhase.getOwner()).isNull();
    }

    @Test
    void validatePhaseReferences_userCreateUnderSystemProcessGetsUserOwner() {
        Process systemProcess = new Process().id(10L);
        systemProcess.setOwner(null);

        User user = new User();
        user.setId(5L);

        Phase newPhase = new Phase().name("New Phase");
        newPhase.setProcess(systemProcess);

        when(processRepository.findById(10L)).thenReturn(Optional.of(systemProcess));
        when(entityAccessService.isAdmin()).thenReturn(false);
        when(entityAccessService.getCurrentUser()).thenReturn(user);

        referenceAccessValidator.validatePhaseReferences(newPhase);

        assertThat(newPhase.getOwner()).isEqualTo(user);
    }

    @Test
    void validateActivityReferences_adminCreateUnderSystemPhaseStaysSystemTemplate() {
        Phase systemPhase = new Phase().id(30L);
        systemPhase.setOwner(null);

        Activity newActivity = new Activity().name("New Activity");
        newActivity.setPhase(systemPhase);

        when(phaseRepository.findById(30L)).thenReturn(Optional.of(systemPhase));
        when(entityAccessService.isAdmin()).thenReturn(true);

        referenceAccessValidator.validateActivityReferences(newActivity);

        assertThat(newActivity.getOwner()).isNull();
    }

    @Test
    void validateActivityReferences_doesNotReassignOwnerOnUpdateOfSystemActivity() {
        Phase systemPhase = new Phase().id(30L);
        systemPhase.setOwner(null);

        Activity systemActivity = new Activity().id(40L).name("Plan");
        systemActivity.setOwner(null);
        systemActivity.setPhase(systemPhase);

        when(phaseRepository.findById(30L)).thenReturn(Optional.of(systemPhase));

        referenceAccessValidator.validateActivityReferences(systemActivity);

        assertThat(systemActivity.getOwner()).isNull();
    }
}
