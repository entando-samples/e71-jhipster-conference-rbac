package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ConferenceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Conference.class);
        Conference conference1 = new Conference();
        conference1.setId(1L);
        Conference conference2 = new Conference();
        conference2.setId(conference1.getId());
        assertThat(conference1).isEqualTo(conference2);
        conference2.setId(2L);
        assertThat(conference1).isNotEqualTo(conference2);
        conference1.setId(null);
        assertThat(conference1).isNotEqualTo(conference2);
    }
}
