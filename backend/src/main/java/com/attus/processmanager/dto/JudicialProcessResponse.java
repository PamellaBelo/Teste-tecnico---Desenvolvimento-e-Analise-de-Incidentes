package com.attus.processmanager.dto;

import com.attus.processmanager.model.ProcessStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Schema(description = "Dados de um processo judicial")
public class JudicialProcessResponse {
    private Long id;
    private String processNumber;
    private String subject;
    private String description;
    private ProcessStatus status;
    private String responsibleName;
    private String responsibleEmail;
    private LocalDate openingDate;
    private LocalDate closingDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
