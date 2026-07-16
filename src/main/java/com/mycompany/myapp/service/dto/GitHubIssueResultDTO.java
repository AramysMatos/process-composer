package com.mycompany.myapp.service.dto;

public class GitHubIssueResultDTO {

    private Long taskId;
    private String gitHubUrl;
    private String gitHubNodeId;

    public GitHubIssueResultDTO() {}

    public GitHubIssueResultDTO(Long taskId, String gitHubUrl, String gitHubNodeId) {
        this.taskId = taskId;
        this.gitHubUrl = gitHubUrl;
        this.gitHubNodeId = gitHubNodeId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getGitHubUrl() {
        return gitHubUrl;
    }

    public void setGitHubUrl(String gitHubUrl) {
        this.gitHubUrl = gitHubUrl;
    }

    public String getGitHubNodeId() {
        return gitHubNodeId;
    }

    public void setGitHubNodeId(String gitHubNodeId) {
        this.gitHubNodeId = gitHubNodeId;
    }
}
