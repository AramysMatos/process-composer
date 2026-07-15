package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Guidelines;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Guidelines entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GuidelinesRepository extends JpaRepository<Guidelines, Long> {}
