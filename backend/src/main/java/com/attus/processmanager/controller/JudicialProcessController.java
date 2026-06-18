package com.attus.processmanager.controller;

import com.attus.processmanager.dto.JudicialProcessRequest;
import com.attus.processmanager.dto.JudicialProcessResponse;
import com.attus.processmanager.dto.PageResponse;
import com.attus.processmanager.model.ProcessStatus;
import com.attus.processmanager.service.JudicialProcessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/processes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Processos Judiciais", description = "Gerenciamento de processos judiciais")
@CrossOrigin(origins = "*")
public class JudicialProcessController {

    private final JudicialProcessService service;

    @PostMapping
    @Operation(summary = "Criar processo", description = "Cria um novo processo judicial")
    @ApiResponse(responseCode = "201", description = "Processo criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "409", description = "Número de processo duplicado")
    public ResponseEntity<JudicialProcessResponse> create(
            @Valid @RequestBody JudicialProcessRequest request) {
        JudicialProcessResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar por ID", description = "Retorna um processo pelo ID")
    @ApiResponse(responseCode = "200", description = "Processo encontrado")
    @ApiResponse(responseCode = "404", description = "Processo não encontrado")
    public ResponseEntity<JudicialProcessResponse> findById(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    @Operation(summary = "Listar processos", description = "Lista processos com filtros opcionais e paginação")
    public ResponseEntity<PageResponse<JudicialProcessResponse>> findAll(
            @Parameter(description = "Filtrar por status") @RequestParam(required = false) ProcessStatus status,
            @Parameter(description = "Buscar por número, assunto ou responsável") @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(service.findAll(status, search, pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar processo", description = "Atualiza um processo existente")
    @ApiResponse(responseCode = "200", description = "Processo atualizado")
    @ApiResponse(responseCode = "404", description = "Processo não encontrado")
    @ApiResponse(responseCode = "409", description = "Número de processo duplicado")
    public ResponseEntity<JudicialProcessResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JudicialProcessRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir processo", description = "Exclui um processo. Processos ATIVOS não podem ser excluídos.")
    @ApiResponse(responseCode = "204", description = "Processo excluído")
    @ApiResponse(responseCode = "409", description = "Processo ativo não pode ser excluído")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
