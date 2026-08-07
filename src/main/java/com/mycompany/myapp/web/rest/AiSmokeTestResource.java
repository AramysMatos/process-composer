package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.domain.enumeration.AiFeature;
import com.mycompany.myapp.service.ai.AiAssistantService;
import com.mycompany.myapp.service.ai.dto.AiCompletionResult;
import com.mycompany.myapp.web.rest.dto.AiSmokeTestRequestDTO;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoint to verify AI infrastructure connectivity.
 */
@RestController
@RequestMapping("/api/ai")
public class AiSmokeTestResource {

    private static final Logger log = LoggerFactory.getLogger(AiSmokeTestResource.class);

    private final AiAssistantService aiAssistantService;
    private final ApplicationProperties applicationProperties;

    public AiSmokeTestResource(AiAssistantService aiAssistantService, ApplicationProperties applicationProperties) {
        this.aiAssistantService = aiAssistantService;
        this.applicationProperties = applicationProperties;
    }

    @PostMapping("/smoke-test")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AiCompletionResult> smokeTest(@Valid @RequestBody AiSmokeTestRequestDTO request) {
        log.debug("REST request to smoke test AI with prompt length {}", request.getPrompt().length());
        int maxOutputTokens = applicationProperties.getAi().getLimits().getMaxOutputTokens();
        AiCompletionResult result = aiAssistantService.complete(request.getPrompt(), maxOutputTokens, AiFeature.SMOKE_TEST);
        return ResponseEntity.ok(result);
    }
}
