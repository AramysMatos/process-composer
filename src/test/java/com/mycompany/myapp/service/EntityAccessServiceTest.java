package com.mycompany.myapp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.mycompany.myapp.domain.Roles;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.security.AuthoritiesConstants;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EntityAccessServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EntityAccessService entityAccessService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setLogin("user");
        SecurityContextHolder
            .getContext()
            .setAuthentication(
                new UsernamePasswordAuthenticationToken("user", "test", Set.of(new SimpleGrantedAuthority(AuthoritiesConstants.USER)))
            );
        when(userRepository.findOneWithAuthoritiesByLogin("user")).thenReturn(Optional.of(currentUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void userCanReadSystemTemplateButNotWrite() {
        Roles role = new Roles().name("Scrum Master");
        assertThat(entityAccessService.canRead(role)).isTrue();
        assertThat(entityAccessService.canWrite(role)).isFalse();
    }

    @Test
    void userCanWriteOwnEntity() {
        Roles role = new Roles().name("My Role");
        role.setOwner(currentUser);
        assertThat(entityAccessService.canWrite(role)).isTrue();
    }

    @Test
    void userCannotAccessOtherUsersEntity() {
        User other = new User();
        other.setId(2L);
        Roles role = new Roles().name("Other Role");
        role.setOwner(other);
        assertThat(entityAccessService.canRead(role)).isFalse();
        assertThatThrownBy(() -> entityAccessService.assertCanWrite(role))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(ex -> ((ResponseStatusException) ex).getStatus())
            .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void prepareForCreateSetsCurrentUserAsOwner() {
        Roles role = new Roles().name("New Role");
        Roles prepared = entityAccessService.prepareForCreate(role);
        assertThat(prepared.getOwnerId()).isEqualTo(1L);
    }
}
