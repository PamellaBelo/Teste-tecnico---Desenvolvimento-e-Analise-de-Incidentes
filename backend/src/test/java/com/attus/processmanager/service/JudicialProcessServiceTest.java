package com.attus.processmanager.service;

import com.attus.processmanager.dto.JudicialProcessRequest;
import com.attus.processmanager.dto.JudicialProcessResponse;
import com.attus.processmanager.exception.BusinessException;
import com.attus.processmanager.exception.ResourceNotFoundException;
import com.attus.processmanager.mapper.JudicialProcessMapper;
import com.attus.processmanager.model.JudicialProcess;
import com.attus.processmanager.model.ProcessStatus;
import com.attus.processmanager.repository.JudicialProcessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JudicialProcessService")
class JudicialProcessServiceTest {

    @Mock private JudicialProcessRepository repository;
    @Mock private JudicialProcessMapper mapper;
    @InjectMocks private JudicialProcessService service;

    private JudicialProcessRequest validRequest;
    private JudicialProcess savedEntity;
    private JudicialProcessResponse expectedResponse;

    @BeforeEach
    void setUp() {
        validRequest = new JudicialProcessRequest();
        validRequest.setProcessNumber("1234567-89.2024.8.26.0001");
        validRequest.setSubject("Execução Fiscal - IPTU");
        validRequest.setStatus(ProcessStatus.ACTIVE);
        validRequest.setResponsibleName("Dra. Ana Paula");
        validRequest.setResponsibleEmail("ana@procuradoria.gov.br");
        validRequest.setOpeningDate(LocalDate.now());

        savedEntity = JudicialProcess.builder()
            .id(1L)
            .processNumber(validRequest.getProcessNumber())
            .subject(validRequest.getSubject())
            .status(ProcessStatus.ACTIVE)
            .responsibleName(validRequest.getResponsibleName())
            .responsibleEmail(validRequest.getResponsibleEmail())
            .openingDate(validRequest.getOpeningDate())
            .build();

        expectedResponse = new JudicialProcessResponse();
        expectedResponse.setId(1L);
        expectedResponse.setProcessNumber(validRequest.getProcessNumber());
    }

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create process when data is valid")
        void shouldCreateProcess() {
            when(repository.existsByProcessNumber(any())).thenReturn(false);
            when(mapper.toEntity(any())).thenReturn(savedEntity);
            when(repository.save(any())).thenReturn(savedEntity);
            when(mapper.toResponse(any())).thenReturn(expectedResponse);

            JudicialProcessResponse result = service.create(validRequest);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            verify(repository).save(any(JudicialProcess.class));
        }

        @Test
        @DisplayName("should throw BusinessException when process number already exists")
        void shouldThrowWhenDuplicateNumber() {
            when(repository.existsByProcessNumber(any())).thenReturn(true);

            assertThatThrownBy(() -> service.create(validRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(validRequest.getProcessNumber());

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("should throw BusinessException when closing date is before opening date")
        void shouldThrowWhenInvalidClosingDate() {
            validRequest.setOpeningDate(LocalDate.of(2024, 6, 1));
            validRequest.setClosingDate(LocalDate.of(2024, 5, 1));

            when(repository.existsByProcessNumber(any())).thenReturn(false);

            assertThatThrownBy(() -> service.create(validRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("encerramento");
        }
    }

    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("should return process when found")
        void shouldReturnProcess() {
            when(repository.findById(1L)).thenReturn(Optional.of(savedEntity));
            when(mapper.toResponse(savedEntity)).thenReturn(expectedResponse);

            JudicialProcessResponse result = service.findById(1L);

            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("should delete process when status is not ACTIVE")
        void shouldDeleteWhenNotActive() {
            savedEntity.setStatus(ProcessStatus.ARCHIVED);
            when(repository.findById(1L)).thenReturn(Optional.of(savedEntity));

            service.delete(1L);

            verify(repository).delete(savedEntity);
        }

        @Test
        @DisplayName("should throw BusinessException when trying to delete ACTIVE process")
        void shouldThrowWhenActiveProcess() {
            savedEntity.setStatus(ProcessStatus.ACTIVE);
            when(repository.findById(1L)).thenReturn(Optional.of(savedEntity));

            assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ATIVO");

            verify(repository, never()).delete(any());
        }
    }
}
