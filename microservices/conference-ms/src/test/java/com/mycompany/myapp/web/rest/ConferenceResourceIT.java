package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Conference;
import com.mycompany.myapp.repository.ConferenceRepository;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ConferenceResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ConferenceResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_LOCATION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/conferences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ConferenceRepository conferenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restConferenceMockMvc;

    private Conference conference;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Conference createEntity(EntityManager em) {
        Conference conference = new Conference().name(DEFAULT_NAME).location(DEFAULT_LOCATION);
        return conference;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Conference createUpdatedEntity(EntityManager em) {
        Conference conference = new Conference().name(UPDATED_NAME).location(UPDATED_LOCATION);
        return conference;
    }

    @BeforeEach
    public void initTest() {
        conference = createEntity(em);
    }

    @Test
    @Transactional
    void createConference() throws Exception {
        int databaseSizeBeforeCreate = conferenceRepository.findAll().size();
        // Create the Conference
        restConferenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isCreated());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeCreate + 1);
        Conference testConference = conferenceList.get(conferenceList.size() - 1);
        assertThat(testConference.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testConference.getLocation()).isEqualTo(DEFAULT_LOCATION);
    }

    @Test
    @Transactional
    void createConferenceWithExistingId() throws Exception {
        // Create the Conference with an existing ID
        conference.setId(1L);

        int databaseSizeBeforeCreate = conferenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restConferenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isBadRequest());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllConferences() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        // Get all the conferenceList
        restConferenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(conference.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].location").value(hasItem(DEFAULT_LOCATION)));
    }

    @Test
    @Transactional
    void getConference() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        // Get the conference
        restConferenceMockMvc
            .perform(get(ENTITY_API_URL_ID, conference.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(conference.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.location").value(DEFAULT_LOCATION));
    }

    @Test
    @Transactional
    void getNonExistingConference() throws Exception {
        // Get the conference
        restConferenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewConference() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();

        // Update the conference
        Conference updatedConference = conferenceRepository.findById(conference.getId()).get();
        // Disconnect from session so that the updates on updatedConference are not directly saved in db
        em.detach(updatedConference);
        updatedConference.name(UPDATED_NAME).location(UPDATED_LOCATION);

        restConferenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedConference.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedConference))
            )
            .andExpect(status().isOk());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
        Conference testConference = conferenceList.get(conferenceList.size() - 1);
        assertThat(testConference.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConference.getLocation()).isEqualTo(UPDATED_LOCATION);
    }

    @Test
    @Transactional
    void putNonExistingConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, conference.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isBadRequest());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isBadRequest());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateConferenceWithPatch() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();

        // Update the conference using partial update
        Conference partialUpdatedConference = new Conference();
        partialUpdatedConference.setId(conference.getId());

        restConferenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConference.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConference))
            )
            .andExpect(status().isOk());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
        Conference testConference = conferenceList.get(conferenceList.size() - 1);
        assertThat(testConference.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testConference.getLocation()).isEqualTo(DEFAULT_LOCATION);
    }

    @Test
    @Transactional
    void fullUpdateConferenceWithPatch() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();

        // Update the conference using partial update
        Conference partialUpdatedConference = new Conference();
        partialUpdatedConference.setId(conference.getId());

        partialUpdatedConference.name(UPDATED_NAME).location(UPDATED_LOCATION);

        restConferenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConference.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConference))
            )
            .andExpect(status().isOk());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
        Conference testConference = conferenceList.get(conferenceList.size() - 1);
        assertThat(testConference.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConference.getLocation()).isEqualTo(UPDATED_LOCATION);
    }

    @Test
    @Transactional
    void patchNonExistingConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, conference.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isBadRequest());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isBadRequest());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamConference() throws Exception {
        int databaseSizeBeforeUpdate = conferenceRepository.findAll().size();
        conference.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConferenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(conference))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Conference in the database
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteConference() throws Exception {
        // Initialize the database
        conferenceRepository.saveAndFlush(conference);

        int databaseSizeBeforeDelete = conferenceRepository.findAll().size();

        // Delete the conference
        restConferenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, conference.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Conference> conferenceList = conferenceRepository.findAll();
        assertThat(conferenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
