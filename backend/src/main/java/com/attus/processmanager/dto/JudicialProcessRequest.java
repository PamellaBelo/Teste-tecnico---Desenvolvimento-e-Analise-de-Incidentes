package com.attus.processmanager.dto;

import com.attus.processmanager.model.ProcessStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "Payload para criação ou atualização de processo judicial")
public class JudicialProcessRequest {

    @NotBlank(message = "Número do processo é obrigatório")
    @Pattern(
        regexp = "\\d{7}-\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}",
        message = "Número do processo deve seguir o formato CNJ: 9999999-99.9999.9.99.9999"
    )
    @Schema(example = "1234567-89.2024.8.26.0001", description = "Número CNJ do processo")
    private String processNumber;

    @NotBlank(message = "Assunto é obrigatório")
    @Size(max = 255, message = "Assunto deve ter no máximo 255 caracteres")
    @Schema(example = "Ação de Cobrança de Dívida Ativa Municipal")
    private String subject;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    @Schema(example = "Execução fiscal referente ao IPTU dos exercícios de 2020 a 2023")
    private String description;

    @NotNull(message = "Status é obrigatório")
    @Schema(example = "ACTIVE")
    private ProcessStatus status;

    @NotBlank(message = "Nome do responsável é obrigatório")
    @Size(max = 150, message = "Nome do responsável deve ter no máximo 150 caracteres")
    @Schema(example = "Dra. Ana Paula Ferreira")
    private String responsibleName;

    @NotBlank(message = "E-mail do responsável é obrigatório")
    @Email(message = "E-mail inválido")
    @Size(max = 150)
    @Schema(example = "ana.ferreira@procuradoria.sp.gov.br")
    private String responsibleEmail;

    @NotNull(message = "Data de abertura é obrigatória")
    @PastOrPresent(message = "Data de abertura não pode ser no futuro")
    @Schema(example = "2024-01-15")
    private LocalDate openingDate;

    @Schema(example = "2024-12-31")
    private LocalDate closingDate;
}
