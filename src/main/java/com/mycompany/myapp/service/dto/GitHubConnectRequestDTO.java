package com.mycompany.myapp.service.dto;

import javax.validation.constraints.NotBlank;

public class GitHubConnectRequestDTO {

    @NotBlank
    private String token;

    @NotBlank
    private String repository;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }
}
