package com.attus.processmanager.controller;

import com.attus.processmanager.dto.JudicialProcessRequest;
import com.attus.processmanager.model.JudicialProcess;
import com.attus.processmanager.model.ProcessStatus;
import com.attus.processmanager.repository.JudicialProcessRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("JudicialProcessController - Integration Tests")
class JudicialProcessControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JudicialProcessRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private JudicialProcessRequest buildValidRequest() {
        JudicialProcessRequest req = new JudicialProcessRequest();
        req.setProcessNumber("1234567-89.2024.8.26.0001");
        req.setSubject("Execução Fiscal - IPTU");
        req.setStatus(ProcessStatus.ACTIVE);
        req.setResponsibleName("Dra. Ana Paula");
        req.setResponsibleEmail("ana@procuradoria.gov.br");
        req.setOpeningDate(LocalDate.now());
        return req;
    }

    @Test
    @DisplayName("POST /api/v1/processes - should create process and return 201")
    void shouldCreateProcess() throws Exception {
        mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildValidRequest())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.processNumber").value("1234567-89.2024.8.26.0001"));
    }

    @Test
    @DisplayName("POST /api/v1/processes - should return 400 for invalid process number format")
    void shouldReturn400ForInvalidFormat() throws Exception {
        JudicialProcessRequest req = buildValidRequest();
        req.setProcessNumber("INVALIDO");

        mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.processNumber").exists());
    }

    @Test
    @DisplayName("POST /api/v1/processes - should return 409 for duplicate process number")
    void shouldReturn409ForDuplicate() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("GET /api/v1/processes/{id} - should return 404 when not found")
    void shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/processes/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/processes - should list with pagination")
    void shouldListProcesses() throws Exception {
        // Create via POST
        mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildValidRequest())))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/processes").param("page", "0").param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("DELETE /api/v1/processes/{id} - should return 409 when process is ACTIVE")
    void shouldReturn409WhenDeletingActive() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        String response = mockMvc.perform(post("/api/v1/processes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/v1/processes/" + id))
            .andExpect(status().isConflict());
    }
}
