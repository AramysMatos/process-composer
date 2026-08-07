package com.mycompany.myapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.config.PlatformSettingRegistry;
import com.mycompany.myapp.domain.User;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeatureFlagServiceTest {

    @Mock
    private PlatformSettingService platformSettingService;

    private FeatureFlagService featureFlagService;

    @BeforeEach
    void setUp() {
        featureFlagService = new FeatureFlagService(platformSettingService, new PlatformSettingRegistry());
    }

    @Test
    void isEnabled_returnsTrueWhenValueIsTrue() {
        when(platformSettingService.getValue(PlatformSettingKeys.AI_ENABLED)).thenReturn(Optional.of("true"));

        assertThat(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).isTrue();
        assertThat(featureFlagService.isAiEnabled()).isTrue();
    }

    @Test
    void isEnabled_returnsFalseWhenValueMissing() {
        when(platformSettingService.getValue(PlatformSettingKeys.AI_ENABLED)).thenReturn(Optional.empty());

        assertThat(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).isFalse();
    }

    @Test
    void setEnabled_persistsBooleanAsString() {
        User user = new User();
        user.setId(1L);

        featureFlagService.setEnabled(PlatformSettingKeys.AI_ENABLED, true, user);

        verify(platformSettingService).setValue(PlatformSettingKeys.AI_ENABLED, "true", user);
    }

    @Test
    void getPublicFlags_returnsWhitelistedFlagsOnly() {
        when(platformSettingService.getValue(PlatformSettingKeys.AI_ENABLED)).thenReturn(Optional.of("false"));

        Map<String, Boolean> flags = featureFlagService.getPublicFlags();

        assertThat(flags).containsEntry(PlatformSettingKeys.AI_ENABLED, false);
    }
}
