package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Artifacts;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface ArtifactsRepositoryWithBagRelationships {
    Optional<Artifacts> fetchBagRelationships(Optional<Artifacts> artifacts);

    List<Artifacts> fetchBagRelationships(List<Artifacts> artifacts);

    Page<Artifacts> fetchBagRelationships(Page<Artifacts> artifacts);
}
