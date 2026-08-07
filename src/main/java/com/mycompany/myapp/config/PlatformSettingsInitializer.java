package com.mycompany.myapp.config;

import com.mycompany.myapp.service.PlatformSettingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds platform settings from registry and yaml defaults on startup.
 */
@Component
public class PlatformSettingsInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformSettingsInitializer.class);

    private final PlatformSettingService platformSettingService;

    public PlatformSettingsInitializer(PlatformSettingService platformSettingService) {
        this.platformSettingService = platformSettingService;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.debug("Ensuring platform setting defaults");
        platformSettingService.ensureDefaults();
    }
}
