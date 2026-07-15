package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Templates;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Templates entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TemplatesRepository extends JpaRepository<Templates, Long> {}
