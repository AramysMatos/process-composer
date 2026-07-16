package com.mycompany.myapp.service.dto;

public class GitHubValidateResponseDTO {

    private boolean valid;

    public GitHubValidateResponseDTO() {}

    public GitHubValidateResponseDTO(boolean valid) {
        this.valid = valid;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }
}
