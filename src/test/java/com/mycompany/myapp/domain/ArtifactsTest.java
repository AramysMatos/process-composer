package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ArtifactsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Artifacts.class);
        Artifacts artifacts1 = new Artifacts();
        artifacts1.setId(1L);
        Artifacts artifacts2 = new Artifacts();
        artifacts2.setId(artifacts1.getId());
        assertThat(artifacts1).isEqualTo(artifacts2);
        artifacts2.setId(2L);
        assertThat(artifacts1).isNotEqualTo(artifacts2);
        artifacts1.setId(null);
        assertThat(artifacts1).isNotEqualTo(artifacts2);
    }
}
