package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link PlatformSetting} entity.
 */
@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {}
