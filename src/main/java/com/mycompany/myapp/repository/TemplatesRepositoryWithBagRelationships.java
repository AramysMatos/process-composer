package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Templates;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface TemplatesRepositoryWithBagRelationships {
    Optional<Templates> fetchBagRelationships(Optional<Templates> templates);

    List<Templates> fetchBagRelationships(List<Templates> templates);

    Page<Templates> fetchBagRelationships(Page<Templates> templates);
}
