package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.domain.PlatformSetting;
import com.mycompany.myapp.repository.PlatformSettingRepository;
import com.mycompany.myapp.security.AuthoritiesConstants;
import com.mycompany.myapp.web.rest.vm.UpdatePlatformSettingVM;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@IntegrationTest
@AutoConfigureMockMvc
class PlatformSettingsResourceIT {

    private static final String ADMIN_URL = "/api/admin/platform-settings";
    private static final String FLAGS_URL = "/api/platform-settings/flags";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlatformSettingRepository platformSettingRepository;

    @Test
    @Transactional
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    void getAllPlatformSettings_asAdmin_returnsRegisteredSettings() throws Exception {
        mockMvc
            .perform(get(ADMIN_URL))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.key == 'feature.ai.enabled')]").exists())
            .andExpect(jsonPath("$[?(@.key == 'feature.ai.enabled')].type").value("BOOLEAN"));
    }

    @Test
    @Transactional
    @WithMockUser(authorities = AuthoritiesConstants.USER)
    void getAllPlatformSettings_asUser_isForbidden() throws Exception {
        mockMvc.perform(get(ADMIN_URL)).andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    void updatePlatformSetting_asAdmin_persistsValue() throws Exception {
        UpdatePlatformSettingVM payload = new UpdatePlatformSettingVM();
        payload.setValue("true");

        mockMvc
            .perform(
                put(ADMIN_URL + "/" + PlatformSettingKeys.AI_ENABLED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(payload))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.key").value(PlatformSettingKeys.AI_ENABLED))
            .andExpect(jsonPath("$.value").value("true"));

        PlatformSetting setting = platformSettingRepository.findById(PlatformSettingKeys.AI_ENABLED).orElseThrow();
        assertThat(setting.getSettingValue()).isEqualTo("true");
    }

    @Test
    @Transactional
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    void updatePlatformSetting_withUnknownKey_returnsBadRequest() throws Exception {
        UpdatePlatformSettingVM payload = new UpdatePlatformSettingVM();
        payload.setValue("true");

        mockMvc
            .perform(
                put(ADMIN_URL + "/unknown.setting.key")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(payload))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    @WithMockUser(authorities = AuthoritiesConstants.USER)
    void getPublicFlags_asAuthenticatedUser_returnsFlags() throws Exception {
        mockMvc.perform(get(FLAGS_URL)).andExpect(status().isOk()).andExpect(jsonPath("$['feature.ai.enabled']").exists());
    }
}
