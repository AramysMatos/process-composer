package com.mycompany.myapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.mycompany.myapp.domain.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.test.web.client.response.MockRestResponseCreators;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

class GitHubServiceTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private GitHubService gitHubService;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        gitHubService = new GitHubService(restTemplate);
    }

    @Test
    void connectProject_persistsCredentialsOnlyWhenValidationSucceeds() {
        Project project = new Project().id(1L).gitHubToken("old-token").gitHubRepository("owner/old-repo");

        mockServer
            .expect(MockRestRequestMatchers.requestTo("https://api.github.com/repos/owner/new-repo"))
            .andExpect(MockRestRequestMatchers.method(HttpMethod.GET))
            .andExpect(MockRestRequestMatchers.header("Authorization", "Bearer new-token"))
            .andRespond(MockRestResponseCreators.withSuccess("{}", MediaType.APPLICATION_JSON));

        gitHubService.connectProject(project, "new-token", "owner/new-repo");

        assertThat(project.getGitHubToken()).isEqualTo("new-token");
        assertThat(project.getGitHubRepository()).isEqualTo("owner/new-repo");
        mockServer.verify();
    }

    @Test
    void connectProject_doesNotPersistCredentialsWhenValidationFails() {
        Project project = new Project().id(1L).gitHubToken("still-valid-token").gitHubRepository("owner/repo");

        mockServer
            .expect(MockRestRequestMatchers.requestTo("https://api.github.com/repos/owner/repo"))
            .andExpect(MockRestRequestMatchers.method(HttpMethod.GET))
            .andRespond(MockRestResponseCreators.withUnauthorizedRequest());

        assertThatThrownBy(() -> gitHubService.connectProject(project, "invalid-token", "owner/repo"))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Token do GitHub inválido");

        assertThat(project.getGitHubToken()).isEqualTo("still-valid-token");
        assertThat(project.getGitHubRepository()).isEqualTo("owner/repo");
        mockServer.verify();
    }
}
