package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Tools;
import com.mycompany.myapp.repository.ToolsRepository;
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
 * Integration tests for the {@link ToolsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ToolsResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/tools";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ToolsRepository toolsRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restToolsMockMvc;

    private Tools tools;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tools createEntity(EntityManager em) {
        Tools tools = new Tools().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return tools;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tools createUpdatedEntity(EntityManager em) {
        Tools tools = new Tools().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return tools;
    }

    @BeforeEach
    public void initTest() {
        tools = createEntity(em);
    }

    @Test
    @Transactional
    void createTools() throws Exception {
        int databaseSizeBeforeCreate = toolsRepository.findAll().size();
        // Create the Tools
        restToolsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tools)))
            .andExpect(status().isCreated());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeCreate + 1);
        Tools testTools = toolsList.get(toolsList.size() - 1);
        assertThat(testTools.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testTools.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createToolsWithExistingId() throws Exception {
        // Create the Tools with an existing ID
        tools.setId(1L);

        int databaseSizeBeforeCreate = toolsRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restToolsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tools)))
            .andExpect(status().isBadRequest());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllTools() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        // Get all the toolsList
        restToolsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tools.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getTools() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        // Get the tools
        restToolsMockMvc
            .perform(get(ENTITY_API_URL_ID, tools.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(tools.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingTools() throws Exception {
        // Get the tools
        restToolsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTools() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();

        // Update the tools
        Tools updatedTools = toolsRepository.findById(tools.getId()).get();
        // Disconnect from session so that the updates on updatedTools are not directly saved in db
        em.detach(updatedTools);
        updatedTools.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restToolsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTools.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTools))
            )
            .andExpect(status().isOk());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
        Tools testTools = toolsList.get(toolsList.size() - 1);
        assertThat(testTools.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTools.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tools.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(tools))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(tools))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tools)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateToolsWithPatch() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();

        // Update the tools using partial update
        Tools partialUpdatedTools = new Tools();
        partialUpdatedTools.setId(tools.getId());

        partialUpdatedTools.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restToolsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTools.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTools))
            )
            .andExpect(status().isOk());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
        Tools testTools = toolsList.get(toolsList.size() - 1);
        assertThat(testTools.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTools.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateToolsWithPatch() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();

        // Update the tools using partial update
        Tools partialUpdatedTools = new Tools();
        partialUpdatedTools.setId(tools.getId());

        partialUpdatedTools.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restToolsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTools.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTools))
            )
            .andExpect(status().isOk());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
        Tools testTools = toolsList.get(toolsList.size() - 1);
        assertThat(testTools.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testTools.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, tools.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(tools))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(tools))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTools() throws Exception {
        int databaseSizeBeforeUpdate = toolsRepository.findAll().size();
        tools.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restToolsMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(tools)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tools in the database
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTools() throws Exception {
        // Initialize the database
        toolsRepository.saveAndFlush(tools);

        int databaseSizeBeforeDelete = toolsRepository.findAll().size();

        // Delete the tools
        restToolsMockMvc
            .perform(delete(ENTITY_API_URL_ID, tools.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Tools> toolsList = toolsRepository.findAll();
        assertThat(toolsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
