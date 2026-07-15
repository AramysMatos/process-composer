package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Tools;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Tools entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ToolsRepository extends JpaRepository<Tools, Long> {}
