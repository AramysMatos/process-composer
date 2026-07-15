package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Artifacts;
import com.mycompany.myapp.repository.ArtifactsRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ArtifactsResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ArtifactsResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_OPTIONAL = false;
    private static final Boolean UPDATED_OPTIONAL = true;

    private static final String ENTITY_API_URL = "/api/artifacts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ArtifactsRepository artifactsRepository;

    @Mock
    private ArtifactsRepository artifactsRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restArtifactsMockMvc;

    private Artifacts artifacts;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Artifacts createEntity(EntityManager em) {
        Artifacts artifacts = new Artifacts().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION).optional(DEFAULT_OPTIONAL);
        return artifacts;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Artifacts createUpdatedEntity(EntityManager em) {
        Artifacts artifacts = new Artifacts().name(UPDATED_NAME).description(UPDATED_DESCRIPTION).optional(UPDATED_OPTIONAL);
        return artifacts;
    }

    @BeforeEach
    public void initTest() {
        artifacts = createEntity(em);
    }

    @Test
    @Transactional
    void createArtifacts() throws Exception {
        int databaseSizeBeforeCreate = artifactsRepository.findAll().size();
        // Create the Artifacts
        restArtifactsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(artifacts)))
            .andExpect(status().isCreated());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeCreate + 1);
        Artifacts testArtifacts = artifactsList.get(artifactsList.size() - 1);
        assertThat(testArtifacts.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testArtifacts.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testArtifacts.getOptional()).isEqualTo(DEFAULT_OPTIONAL);
    }

    @Test
    @Transactional
    void createArtifactsWithExistingId() throws Exception {
        // Create the Artifacts with an existing ID
        artifacts.setId(1L);

        int databaseSizeBeforeCreate = artifactsRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restArtifactsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(artifacts)))
            .andExpect(status().isBadRequest());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllArtifacts() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        // Get all the artifactsList
        restArtifactsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(artifacts.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].optional").value(hasItem(DEFAULT_OPTIONAL.booleanValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllArtifactsWithEagerRelationshipsIsEnabled() throws Exception {
        when(artifactsRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restArtifactsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(artifactsRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllArtifactsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(artifactsRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restArtifactsMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(artifactsRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getArtifacts() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        // Get the artifacts
        restArtifactsMockMvc
            .perform(get(ENTITY_API_URL_ID, artifacts.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(artifacts.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.optional").value(DEFAULT_OPTIONAL.booleanValue()));
    }

    @Test
    @Transactional
    void getNonExistingArtifacts() throws Exception {
        // Get the artifacts
        restArtifactsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingArtifacts() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();

        // Update the artifacts
        Artifacts updatedArtifacts = artifactsRepository.findById(artifacts.getId()).get();
        // Disconnect from session so that the updates on updatedArtifacts are not directly saved in db
        em.detach(updatedArtifacts);
        updatedArtifacts.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).optional(UPDATED_OPTIONAL);

        restArtifactsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedArtifacts.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedArtifacts))
            )
            .andExpect(status().isOk());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
        Artifacts testArtifacts = artifactsList.get(artifactsList.size() - 1);
        assertThat(testArtifacts.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testArtifacts.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testArtifacts.getOptional()).isEqualTo(UPDATED_OPTIONAL);
    }

    @Test
    @Transactional
    void putNonExistingArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, artifacts.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(artifacts))
            )
            .andExpect(status().isBadRequest());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(artifacts))
            )
            .andExpect(status().isBadRequest());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(artifacts)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateArtifactsWithPatch() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();

        // Update the artifacts using partial update
        Artifacts partialUpdatedArtifacts = new Artifacts();
        partialUpdatedArtifacts.setId(artifacts.getId());

        partialUpdatedArtifacts.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restArtifactsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArtifacts.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArtifacts))
            )
            .andExpect(status().isOk());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
        Artifacts testArtifacts = artifactsList.get(artifactsList.size() - 1);
        assertThat(testArtifacts.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testArtifacts.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testArtifacts.getOptional()).isEqualTo(DEFAULT_OPTIONAL);
    }

    @Test
    @Transactional
    void fullUpdateArtifactsWithPatch() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();

        // Update the artifacts using partial update
        Artifacts partialUpdatedArtifacts = new Artifacts();
        partialUpdatedArtifacts.setId(artifacts.getId());

        partialUpdatedArtifacts.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).optional(UPDATED_OPTIONAL);

        restArtifactsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArtifacts.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArtifacts))
            )
            .andExpect(status().isOk());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
        Artifacts testArtifacts = artifactsList.get(artifactsList.size() - 1);
        assertThat(testArtifacts.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testArtifacts.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testArtifacts.getOptional()).isEqualTo(UPDATED_OPTIONAL);
    }

    @Test
    @Transactional
    void patchNonExistingArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, artifacts.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(artifacts))
            )
            .andExpect(status().isBadRequest());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(artifacts))
            )
            .andExpect(status().isBadRequest());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamArtifacts() throws Exception {
        int databaseSizeBeforeUpdate = artifactsRepository.findAll().size();
        artifacts.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArtifactsMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(artifacts))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Artifacts in the database
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteArtifacts() throws Exception {
        // Initialize the database
        artifactsRepository.saveAndFlush(artifacts);

        int databaseSizeBeforeDelete = artifactsRepository.findAll().size();

        // Delete the artifacts
        restArtifactsMockMvc
            .perform(delete(ENTITY_API_URL_ID, artifacts.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Artifacts> artifactsList = artifactsRepository.findAll();
        assertThat(artifactsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
