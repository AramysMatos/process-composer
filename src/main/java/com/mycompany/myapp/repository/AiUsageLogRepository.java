package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.AiUsageLog;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for {@link AiUsageLog}.
 */
@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    @Query(
        "SELECT COALESCE(SUM(l.inputTokens + l.outputTokens), 0) FROM AiUsageLog l WHERE l.user.id = :userId AND l.createdAt >= :startOfDay"
    )
    long sumTokensByUserSince(@Param("userId") Long userId, @Param("startOfDay") Instant startOfDay);

    @Query("SELECT COALESCE(SUM(l.inputTokens + l.outputTokens), 0) FROM AiUsageLog l WHERE l.createdAt >= :startOfDay")
    long sumTokensGlobalSince(@Param("startOfDay") Instant startOfDay);
}
