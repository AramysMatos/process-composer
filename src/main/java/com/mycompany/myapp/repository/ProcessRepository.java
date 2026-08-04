package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Process;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Process entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProcessRepository extends JpaRepository<Process, Long> {
    @Query("SELECT p FROM Process p WHERE p.owner IS NULL OR p.owner.id = :userId")
    List<Process> findAllVisibleToUser(@Param("userId") Long userId);

    @Query(
        value = "SELECT p FROM Process p WHERE p.owner IS NULL OR p.owner.id = :userId",
        countQuery = "SELECT count(p) FROM Process p WHERE p.owner IS NULL OR p.owner.id = :userId"
    )
    Page<Process> findAllVisibleToUser(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Process p WHERE p.id = :id AND (p.owner IS NULL OR p.owner.id = :userId)")
    Optional<Process> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);
}
