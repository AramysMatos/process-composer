package com.mycompany.myapp.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mycompany.myapp.domain.Project;
import com.mycompany.myapp.service.dto.GitHubIssueRequestDTO;
import com.mycompany.myapp.service.dto.GitHubIssueResultDTO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GitHubService {

    private static final Logger log = LoggerFactory.getLogger(GitHubService.class);
    private static final String GITHUB_API_BASE = "https://api.github.com";
    private static final Pattern REPOSITORY_PATTERN = Pattern.compile("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$");

    private final RestTemplate restTemplate;
    private final ProjectGitHubTokenService projectGitHubTokenService;

    public GitHubService(RestTemplate restTemplate, ProjectGitHubTokenService projectGitHubTokenService) {
        this.restTemplate = restTemplate;
        this.projectGitHubTokenService = projectGitHubTokenService;
    }

    public void validateConnection(Project project) {
        validateConnection(requireToken(project), requireRepository(project));
    }

    public void validateConnection(String token, String repository) {
        String normalizedToken = requireTokenValue(token);
        String normalizedRepository = requireRepositoryValue(repository);
        String url = GITHUB_API_BASE + "/repos/" + normalizedRepository;

        try {
            restTemplate.exchange(url, HttpMethod.GET, authorizedEntity(normalizedToken, null), String.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token do GitHub inválido ou sem permissão para o repositório.");
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repositório não encontrado. Verifique o formato owner/repo.");
        } catch (HttpClientErrorException e) {
            log.warn("GitHub validation failed for repository {}: {}", normalizedRepository, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao validar conexão com o GitHub: " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected error validating GitHub connection", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao comunicar com a API do GitHub.");
        }
    }

    /**
     * Validates token and repository against GitHub, then updates the project only when validation succeeds.
     */
    public void connectProject(Project project, String token, String repository) {
        String normalizedToken = requireTokenValue(token);
        String normalizedRepository = requireRepositoryValue(repository);
        validateConnection(normalizedToken, normalizedRepository);
        projectGitHubTokenService.storeToken(project, normalizedToken);
        project.setGitHubRepository(normalizedRepository);
    }

    public List<GitHubIssueResultDTO> createIssues(Project project, List<GitHubIssueRequestDTO> issues) {
        String token = requireToken(project);
        String repository = requireRepository(project);
        String url = GITHUB_API_BASE + "/repos/" + repository + "/issues";

        List<GitHubIssueResultDTO> results = new ArrayList<>();

        for (GitHubIssueRequestDTO issue : issues) {
            if (issue.getTaskId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada issue deve informar taskId.");
            }

            Map<String, String> body = new HashMap<>();
            body.put("title", issue.getTitle());
            body.put("body", issue.getBody());

            try {
                ResponseEntity<GitHubIssueResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    authorizedEntity(token, body),
                    GitHubIssueResponse.class
                );

                GitHubIssueResponse created = response.getBody();
                if (created == null || created.htmlUrl == null || created.nodeId == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Resposta inesperada ao criar issue no GitHub.");
                }

                results.add(new GitHubIssueResultDTO(issue.getTaskId(), created.htmlUrl, created.nodeId));
            } catch (HttpClientErrorException.Unauthorized e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token do GitHub inválido ou expirado.");
            } catch (HttpClientErrorException e) {
                log.warn("GitHub issue creation failed for task {}: {}", issue.getTaskId(), e.getMessage());
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Falha ao criar issue \"" + issue.getTitle() + "\" no GitHub: " + e.getStatusText()
                );
            } catch (ResponseStatusException e) {
                throw e;
            } catch (Exception e) {
                log.error("Unexpected error creating GitHub issue for task {}", issue.getTaskId(), e);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao comunicar com a API do GitHub.");
            }
        }

        return results;
    }

    private HttpEntity<?> authorizedEntity(String token, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new HttpEntity<>(body, headers);
        }
        return new HttpEntity<>(headers);
    }

    private String requireToken(Project project) {
        return requireTokenValue(projectGitHubTokenService.readToken(project));
    }

    private String requireRepository(Project project) {
        return requireRepositoryValue(project.getGitHubRepository());
    }

    private String requireTokenValue(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token do GitHub é obrigatório.");
        }
        return token.trim();
    }

    private String requireRepositoryValue(String repository) {
        if (repository == null || repository.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repositório do GitHub é obrigatório.");
        }
        String normalized = repository.trim();
        if (!REPOSITORY_PATTERN.matcher(normalized).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repositório inválido. Use o formato owner/repo.");
        }
        return normalized;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GitHubIssueResponse {

        @JsonProperty("html_url")
        private String htmlUrl;

        @JsonProperty("node_id")
        private String nodeId;
    }
}
