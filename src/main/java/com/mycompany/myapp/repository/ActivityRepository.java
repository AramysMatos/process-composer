package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Activity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Activity entity.
 *
 * When extending this class, extend ActivityRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface ActivityRepository extends ActivityRepositoryWithBagRelationships, JpaRepository<Activity, Long> {
    default Optional<Activity> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Activity> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Activity> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select distinct activity from Activity activity left join fetch activity.phase",
        countQuery = "select count(distinct activity) from Activity activity"
    )
    Page<Activity> findAllWithToOneRelationships(Pageable pageable);

    @Query("select distinct activity from Activity activity left join fetch activity.phase")
    List<Activity> findAllWithToOneRelationships();

    @Query("select activity from Activity activity left join fetch activity.phase where activity.id =:id")
    Optional<Activity> findOneWithToOneRelationships(@Param("id") Long id);

    List<Activity> findByPhase_Id(Long phaseId);

    List<Activity> findByPhaseIsNull();

    List<Activity> findByPhase_Process_Id(Long processId);

    List<Activity> findBySubActivities_IdIn(Collection<Long> subActivityIds);

    List<Activity> findByPredecessorActivities_IdIn(Collection<Long> predecessorActivityIds);

    @Query("SELECT a FROM Activity a WHERE a.owner IS NULL OR a.owner.id = :userId")
    List<Activity> findAllVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT a FROM Activity a WHERE a.id = :id AND (a.owner IS NULL OR a.owner.id = :userId)")
    Optional<Activity> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT a FROM Activity a WHERE a.phase IS NULL AND (a.owner IS NULL OR a.owner.id = :userId)")
    List<Activity> findLibraryVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT a FROM Activity a WHERE a.phase.process.id = :processId AND (a.owner IS NULL OR a.owner.id = :userId)")
    List<Activity> findByProcessIdVisibleToUser(@Param("processId") Long processId, @Param("userId") Long userId);

    @Query("SELECT a FROM Activity a WHERE a.phase.id = :phaseId AND (a.owner IS NULL OR a.owner.id = :userId)")
    List<Activity> findByPhaseIdVisibleToUser(@Param("phaseId") Long phaseId, @Param("userId") Long userId);
}
