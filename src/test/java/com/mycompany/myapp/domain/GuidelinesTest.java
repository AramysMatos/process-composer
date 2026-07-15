package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class GuidelinesTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Guidelines.class);
        Guidelines guidelines1 = new Guidelines();
        guidelines1.setId(1L);
        Guidelines guidelines2 = new Guidelines();
        guidelines2.setId(guidelines1.getId());
        assertThat(guidelines1).isEqualTo(guidelines2);
        guidelines2.setId(2L);
        assertThat(guidelines1).isNotEqualTo(guidelines2);
        guidelines1.setId(null);
        assertThat(guidelines1).isNotEqualTo(guidelines2);
    }
}
