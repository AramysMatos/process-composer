package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Tools;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface ToolsRepositoryWithBagRelationships {
    Optional<Tools> fetchBagRelationships(Optional<Tools> tools);

    List<Tools> fetchBagRelationships(List<Tools> tools);

    Page<Tools> fetchBagRelationships(Page<Tools> tools);
}
