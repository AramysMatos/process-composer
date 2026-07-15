package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PhaseTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Phase.class);
        Phase phase1 = new Phase();
        phase1.setId(1L);
        Phase phase2 = new Phase();
        phase2.setId(phase1.getId());
        assertThat(phase1).isEqualTo(phase2);
        phase2.setId(2L);
        assertThat(phase1).isNotEqualTo(phase2);
        phase1.setId(null);
        assertThat(phase1).isNotEqualTo(phase2);
    }
}
