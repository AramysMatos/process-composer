package com.mycompany.myapp.service.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class GitHubIssueRequestDTO {

    @NotNull
    private Long taskId;

    @NotBlank
    private String title;

    @NotBlank
    private String body;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
