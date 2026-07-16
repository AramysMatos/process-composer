package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Project;
import com.mycompany.myapp.repository.ProjectRepository;
import com.mycompany.myapp.service.GitHubService;
import com.mycompany.myapp.service.dto.GitHubIssueRequestDTO;
import com.mycompany.myapp.service.dto.GitHubIssueResultDTO;
import com.mycompany.myapp.service.dto.GitHubValidateResponseDTO;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.util.List;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for GitHub integration on projects.
 * TODO backend: these endpoints are required by /projetos/:id/github — token never leaves the server.
 */
@RestController
@RequestMapping("/api/projects")
@Transactional
public class ProjectGitHubResource {

    private static final Logger log = LoggerFactory.getLogger(ProjectGitHubResource.class);
    private static final String ENTITY_NAME = "project";

    private final ProjectRepository projectRepository;
    private final GitHubService gitHubService;

    public ProjectGitHubResource(ProjectRepository projectRepository, GitHubService gitHubService) {
        this.projectRepository = projectRepository;
        this.gitHubService = gitHubService;
    }

    /**
     * {@code POST /projects/:id/github/validate} : validates saved token and repository against GitHub API.
     */
    @PostMapping("/{id}/github/validate")
    public ResponseEntity<GitHubValidateResponseDTO> validateGitHubConnection(@PathVariable Long id) {
        log.debug("REST request to validate GitHub connection for Project : {}", id);
        Project project = projectRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

        gitHubService.validateConnection(project);
        return ResponseEntity.ok(new GitHubValidateResponseDTO(true));
    }

    /**
     * {@code POST /projects/:id/github/issues} : creates issues on GitHub using the project's saved token.
     */
    @PostMapping("/{id}/github/issues")
    public ResponseEntity<List<GitHubIssueResultDTO>> createGitHubIssues(
        @PathVariable Long id,
        @Valid @RequestBody List<GitHubIssueRequestDTO> issues
    ) {
        log.debug("REST request to create {} GitHub issues for Project : {}", issues.size(), id);
        if (issues.isEmpty()) {
            throw new BadRequestAlertException("At least one issue is required", ENTITY_NAME, "issuesempty");
        }

        Project project = projectRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

        List<GitHubIssueResultDTO> results = gitHubService.createIssues(project, issues);
        return ResponseEntity.ok(results);
    }
}
