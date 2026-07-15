package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Guidelines;
import com.mycompany.myapp.repository.GuidelinesRepository;
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
 * Integration tests for the {@link GuidelinesResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class GuidelinesResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/guidelines";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private GuidelinesRepository guidelinesRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGuidelinesMockMvc;

    private Guidelines guidelines;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Guidelines createEntity(EntityManager em) {
        Guidelines guidelines = new Guidelines().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return guidelines;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Guidelines createUpdatedEntity(EntityManager em) {
        Guidelines guidelines = new Guidelines().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return guidelines;
    }

    @BeforeEach
    public void initTest() {
        guidelines = createEntity(em);
    }

    @Test
    @Transactional
    void createGuidelines() throws Exception {
        int databaseSizeBeforeCreate = guidelinesRepository.findAll().size();
        // Create the Guidelines
        restGuidelinesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(guidelines)))
            .andExpect(status().isCreated());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeCreate + 1);
        Guidelines testGuidelines = guidelinesList.get(guidelinesList.size() - 1);
        assertThat(testGuidelines.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testGuidelines.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createGuidelinesWithExistingId() throws Exception {
        // Create the Guidelines with an existing ID
        guidelines.setId(1L);

        int databaseSizeBeforeCreate = guidelinesRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGuidelinesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(guidelines)))
            .andExpect(status().isBadRequest());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllGuidelines() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        // Get all the guidelinesList
        restGuidelinesMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(guidelines.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getGuidelines() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        // Get the guidelines
        restGuidelinesMockMvc
            .perform(get(ENTITY_API_URL_ID, guidelines.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(guidelines.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingGuidelines() throws Exception {
        // Get the guidelines
        restGuidelinesMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingGuidelines() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();

        // Update the guidelines
        Guidelines updatedGuidelines = guidelinesRepository.findById(guidelines.getId()).get();
        // Disconnect from session so that the updates on updatedGuidelines are not directly saved in db
        em.detach(updatedGuidelines);
        updatedGuidelines.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restGuidelinesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGuidelines.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedGuidelines))
            )
            .andExpect(status().isOk());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
        Guidelines testGuidelines = guidelinesList.get(guidelinesList.size() - 1);
        assertThat(testGuidelines.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testGuidelines.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, guidelines.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(guidelines))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(guidelines))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(guidelines)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGuidelinesWithPatch() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();

        // Update the guidelines using partial update
        Guidelines partialUpdatedGuidelines = new Guidelines();
        partialUpdatedGuidelines.setId(guidelines.getId());

        partialUpdatedGuidelines.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restGuidelinesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGuidelines.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGuidelines))
            )
            .andExpect(status().isOk());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
        Guidelines testGuidelines = guidelinesList.get(guidelinesList.size() - 1);
        assertThat(testGuidelines.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testGuidelines.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateGuidelinesWithPatch() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();

        // Update the guidelines using partial update
        Guidelines partialUpdatedGuidelines = new Guidelines();
        partialUpdatedGuidelines.setId(guidelines.getId());

        partialUpdatedGuidelines.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restGuidelinesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGuidelines.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGuidelines))
            )
            .andExpect(status().isOk());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
        Guidelines testGuidelines = guidelinesList.get(guidelinesList.size() - 1);
        assertThat(testGuidelines.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testGuidelines.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, guidelines.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(guidelines))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(guidelines))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGuidelines() throws Exception {
        int databaseSizeBeforeUpdate = guidelinesRepository.findAll().size();
        guidelines.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuidelinesMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(guidelines))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Guidelines in the database
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGuidelines() throws Exception {
        // Initialize the database
        guidelinesRepository.saveAndFlush(guidelines);

        int databaseSizeBeforeDelete = guidelinesRepository.findAll().size();

        // Delete the guidelines
        restGuidelinesMockMvc
            .perform(delete(ENTITY_API_URL_ID, guidelines.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Guidelines> guidelinesList = guidelinesRepository.findAll();
        assertThat(guidelinesList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
