package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TemplatesTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Templates.class);
        Templates templates1 = new Templates();
        templates1.setId(1L);
        Templates templates2 = new Templates();
        templates2.setId(templates1.getId());
        assertThat(templates1).isEqualTo(templates2);
        templates2.setId(2L);
        assertThat(templates1).isNotEqualTo(templates2);
        templates1.setId(null);
        assertThat(templates1).isNotEqualTo(templates2);
    }
}
