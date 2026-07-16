package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Guidelines;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface GuidelinesRepositoryWithBagRelationships {
    Optional<Guidelines> fetchBagRelationships(Optional<Guidelines> guidelines);

    List<Guidelines> fetchBagRelationships(List<Guidelines> guidelines);

    Page<Guidelines> fetchBagRelationships(Page<Guidelines> guidelines);
}
