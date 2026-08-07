package com.mycompany.myapp.web.rest.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * Request body for the AI smoke test endpoint.
 */
public class AiSmokeTestRequestDTO {

    @NotBlank
    @Size(max = 4000)
    private String prompt;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
