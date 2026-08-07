package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.config.PlatformSettingDefinition;
import com.mycompany.myapp.config.PlatformSettingRegistry;
import com.mycompany.myapp.domain.PlatformSetting;
import com.mycompany.myapp.domain.enumeration.SettingType;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.PlatformSettingService;
import com.mycompany.myapp.service.dto.PlatformSettingDTO;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import com.mycompany.myapp.web.rest.vm.UpdatePlatformSettingVM;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for platform settings and public feature flags.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class PlatformSettingsResource {

    private static final String ENTITY_NAME = "platformSetting";

    private final Logger log = LoggerFactory.getLogger(PlatformSettingsResource.class);

    private final PlatformSettingService platformSettingService;
    private final FeatureFlagService featureFlagService;
    private final PlatformSettingRegistry platformSettingRegistry;
    private final EntityAccessService entityAccessService;

    public PlatformSettingsResource(
        PlatformSettingService platformSettingService,
        FeatureFlagService featureFlagService,
        PlatformSettingRegistry platformSettingRegistry,
        EntityAccessService entityAccessService
    ) {
        this.platformSettingService = platformSettingService;
        this.featureFlagService = featureFlagService;
        this.platformSettingRegistry = platformSettingRegistry;
        this.entityAccessService = entityAccessService;
    }

    /**
     * {@code GET /admin/platform-settings} : list all registered platform settings.
     */
    @GetMapping("/admin/platform-settings")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<PlatformSettingDTO> getAllPlatformSettings() {
        log.debug("REST request to get all platform settings");
        Map<String, PlatformSetting> settingsByKey = platformSettingService
            .findAllEntities()
            .stream()
            .collect(Collectors.toMap(PlatformSetting::getSettingKey, Function.identity()));

        return platformSettingRegistry
            .getAll()
            .stream()
            .map(definition -> toDto(definition, settingsByKey.get(definition.key())))
            .collect(Collectors.toList());
    }

    /**
     * {@code PUT /admin/platform-settings/{key}} : update a platform setting value.
     */
    @PutMapping("/admin/platform-settings/{key:.+}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlatformSettingDTO> updatePlatformSetting(
        @PathVariable String key,
        @Valid @RequestBody UpdatePlatformSettingVM updatePlatformSettingVM
    ) {
        log.debug("REST request to update platform setting {}", key);
        PlatformSettingDefinition definition = platformSettingRegistry
            .findByKey(key)
            .orElseThrow(() -> new BadRequestAlertException("Unknown platform setting key", ENTITY_NAME, "unknownkey"));

        validateValue(definition, updatePlatformSettingVM.getValue());

        if (definition.type() == SettingType.BOOLEAN) {
            featureFlagService.setEnabled(key, parseBoolean(updatePlatformSettingVM.getValue()), entityAccessService.getCurrentUser());
        } else {
            platformSettingService.setValue(key, updatePlatformSettingVM.getValue(), entityAccessService.getCurrentUser());
        }

        PlatformSetting updated = platformSettingService
            .findByKey(key)
            .orElseThrow(() -> new BadRequestAlertException("Setting not found after update", ENTITY_NAME, "idnotfound"));

        return ResponseEntity.ok(toDto(definition, updated));
    }

    /**
     * {@code GET /platform-settings/flags} : public feature flags for authenticated users.
     */
    @GetMapping("/platform-settings/flags")
    public Map<String, Boolean> getPublicFlags() {
        log.debug("REST request to get public platform flags");
        return featureFlagService.getPublicFlags();
    }

    private PlatformSettingDTO toDto(PlatformSettingDefinition definition, PlatformSetting entity) {
        PlatformSettingDTO dto = new PlatformSettingDTO();
        dto.setKey(definition.key());
        dto.setType(definition.type());
        dto.setLabelKey(definition.labelKey());
        dto.setDescriptionKey(definition.descriptionKey());
        dto.setPubliclyReadable(definition.publiclyReadable());

        if (entity != null) {
            dto.setValue(entity.getSettingValue());
            dto.setUpdatedAt(entity.getUpdatedAt());
            if (entity.getUpdatedBy() != null) {
                dto.setUpdatedByLogin(entity.getUpdatedBy().getLogin());
            }
        } else {
            dto.setValue(platformSettingService.getValue(definition.key()).orElse("false"));
        }

        return dto;
    }

    private void validateValue(PlatformSettingDefinition definition, String value) {
        if (definition.type() == SettingType.BOOLEAN) {
            String normalized = value != null ? value.trim().toLowerCase() : "";
            if (!"true".equals(normalized) && !"false".equals(normalized)) {
                throw new BadRequestAlertException("Boolean setting must be true or false", ENTITY_NAME, "invalidvalue");
            }
        }
    }

    private boolean parseBoolean(String value) {
        return "true".equalsIgnoreCase(value != null ? value.trim() : "");
    }
}
