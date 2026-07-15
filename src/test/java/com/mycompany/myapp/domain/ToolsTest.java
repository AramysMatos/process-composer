package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ToolsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Tools.class);
        Tools tools1 = new Tools();
        tools1.setId(1L);
        Tools tools2 = new Tools();
        tools2.setId(tools1.getId());
        assertThat(tools1).isEqualTo(tools2);
        tools2.setId(2L);
        assertThat(tools1).isNotEqualTo(tools2);
        tools1.setId(null);
        assertThat(tools1).isNotEqualTo(tools2);
    }
}
