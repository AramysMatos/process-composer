package com.mycompany.myapp.web.rest;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.security.AuthoritiesConstants;
import com.mycompany.myapp.service.PlatformSettingService;
import com.mycompany.myapp.service.ai.VertexAiClient;
import com.mycompany.myapp.service.ai.dto.VertexGenerateResult;
import com.mycompany.myapp.web.rest.dto.AiSmokeTestRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@IntegrationTest
@AutoConfigureMockMvc
class AiSmokeTestResourceIT {

    private static final String SMOKE_TEST_URL = "/api/ai/smoke-test";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlatformSettingService platformSettingService;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private VertexAiClient vertexAiClient;

    @BeforeEach
    void enableAiFeature() {
        User admin = userRepository.findOneByLogin("admin").orElseThrow();
        platformSettingService.setValue(PlatformSettingKeys.AI_ENABLED, "true", admin);
    }

    @Test
    @Transactional
    @WithMockUser(username = "admin", authorities = AuthoritiesConstants.ADMIN)
    void smokeTest_asAdmin_returnsCompletion() throws Exception {
        when(vertexAiClient.generateContent(anyString(), anyInt(), anyString())).thenReturn(new VertexGenerateResult("OK", 12, 1));

        AiSmokeTestRequestDTO request = new AiSmokeTestRequestDTO();
        request.setPrompt("Responda apenas com a palavra OK.");

        mockMvc
            .perform(post(SMOKE_TEST_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.text").value("OK"))
            .andExpect(jsonPath("$.inputTokens").value(12))
            .andExpect(jsonPath("$.outputTokens").value(1))
            .andExpect(jsonPath("$.feature").value("SMOKE_TEST"));
    }

    @Test
    @Transactional
    @WithMockUser(username = "user", authorities = AuthoritiesConstants.USER)
    void smokeTest_asUser_isForbidden() throws Exception {
        AiSmokeTestRequestDTO request = new AiSmokeTestRequestDTO();
        request.setPrompt("test");

        mockMvc
            .perform(post(SMOKE_TEST_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(request)))
            .andExpect(status().isForbidden());
    }
}
