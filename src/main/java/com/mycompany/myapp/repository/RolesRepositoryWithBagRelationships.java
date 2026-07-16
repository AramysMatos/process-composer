package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Roles;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface RolesRepositoryWithBagRelationships {
    Optional<Roles> fetchBagRelationships(Optional<Roles> roles);

    List<Roles> fetchBagRelationships(List<Roles> roles);

    Page<Roles> fetchBagRelationships(Page<Roles> roles);
}
