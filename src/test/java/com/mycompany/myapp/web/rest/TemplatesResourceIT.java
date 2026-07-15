package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Templates;
import com.mycompany.myapp.repository.TemplatesRepository;
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
 * Integration tests for the {@link TemplatesResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TemplatesResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/templates";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private TemplatesRepository templatesRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTemplatesMockMvc;

    private Templates templates;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Templates createEntity(EntityManager em) {
        Templates templates = new Templates().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return templates;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Templates createUpdatedEntity(EntityManager em) {
        Templates templates = new Templates().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return templates;
    }

    @BeforeEach
    public void initTest() {
        templates = createEntity(em);
    }

    @Test
    @Transactional
    void createTemplates() throws Exception {
        int databaseSizeBeforeCreate = templatesRepository.findAll().size();
        // Create the Templates
        restTemplatesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(templates)))
            .andExpect(status().isCreated());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeCreate + 1);
        Templates testTemplates = templatesList.get(templatesList.size() - 1);
        assertThat(testTemplates.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTemplates.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createTemplatesWithExistingId() throws Exception {
        // Create the Templates with an existing ID
        templates.setId(1L);

        int databaseSizeBeforeCreate = templatesRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTemplatesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(templates)))
            .andExpect(status().isBadRequest());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllTemplates() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        // Get all the templatesList
        restTemplatesMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(templates.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getTemplates() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        // Get the templates
        restTemplatesMockMvc
            .perform(get(ENTITY_API_URL_ID, templates.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(templates.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingTemplates() throws Exception {
        // Get the templates
        restTemplatesMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTemplates() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();

        // Update the templates
        Templates updatedTemplates = templatesRepository.findById(templates.getId()).get();
        // Disconnect from session so that the updates on updatedTemplates are not directly saved in db
        em.detach(updatedTemplates);
        updatedTemplates.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restTemplatesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTemplates.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTemplates))
            )
            .andExpect(status().isOk());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
        Templates testTemplates = templatesList.get(templatesList.size() - 1);
        assertThat(testTemplates.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTemplates.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, templates.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(templates))
            )
            .andExpect(status().isBadRequest());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(templates))
            )
            .andExpect(status().isBadRequest());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(templates)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTemplatesWithPatch() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();

        // Update the templates using partial update
        Templates partialUpdatedTemplates = new Templates();
        partialUpdatedTemplates.setId(templates.getId());

        restTemplatesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTemplates.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTemplates))
            )
            .andExpect(status().isOk());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
        Templates testTemplates = templatesList.get(templatesList.size() - 1);
        assertThat(testTemplates.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTemplates.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateTemplatesWithPatch() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();

        // Update the templates using partial update
        Templates partialUpdatedTemplates = new Templates();
        partialUpdatedTemplates.setId(templates.getId());

        partialUpdatedTemplates.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restTemplatesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTemplates.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTemplates))
            )
            .andExpect(status().isOk());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
        Templates testTemplates = templatesList.get(templatesList.size() - 1);
        assertThat(testTemplates.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTemplates.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, templates.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(templates))
            )
            .andExpect(status().isBadRequest());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(templates))
            )
            .andExpect(status().isBadRequest());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTemplates() throws Exception {
        int databaseSizeBeforeUpdate = templatesRepository.findAll().size();
        templates.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTemplatesMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(templates))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Templates in the database
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTemplates() throws Exception {
        // Initialize the database
        templatesRepository.saveAndFlush(templates);

        int databaseSizeBeforeDelete = templatesRepository.findAll().size();

        // Delete the templates
        restTemplatesMockMvc
            .perform(delete(ENTITY_API_URL_ID, templates.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Templates> templatesList = templatesRepository.findAll();
        assertThat(templatesList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
