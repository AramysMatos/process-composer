package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Activity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface ActivityRepositoryWithBagRelationships {
    Optional<Activity> fetchBagRelationships(Optional<Activity> activity);

    List<Activity> fetchBagRelationships(List<Activity> activities);

    Page<Activity> fetchBagRelationships(Page<Activity> activities);
}
