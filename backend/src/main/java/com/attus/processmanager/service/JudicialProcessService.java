package com.attus.processmanager.service;

import com.attus.processmanager.dto.JudicialProcessRequest;
import com.attus.processmanager.dto.JudicialProcessResponse;
import com.attus.processmanager.dto.PageResponse;
import com.attus.processmanager.exception.BusinessException;
import com.attus.processmanager.exception.ResourceNotFoundException;
import com.attus.processmanager.mapper.JudicialProcessMapper;
import com.attus.processmanager.model.JudicialProcess;
import com.attus.processmanager.model.ProcessStatus;
import com.attus.processmanager.repository.JudicialProcessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JudicialProcessService {

    private final JudicialProcessRepository repository;
    private final JudicialProcessMapper mapper;

    @Transactional
    public JudicialProcessResponse create(JudicialProcessRequest request) {
        log.info("action=create_process process_number={} responsible={}",
            request.getProcessNumber(), request.getResponsibleEmail());

        if (repository.existsByProcessNumber(request.getProcessNumber())) {
            log.warn("action=create_process_failed reason=duplicate_number process_number={}",
                request.getProcessNumber());
            throw new BusinessException("DUPLICATE_PROCESS_NUMBER",
                "Já existe um processo com o número: " + request.getProcessNumber());
        }

        validateClosingDate(request);

        JudicialProcess entity = mapper.toEntity(request);
        JudicialProcess saved = repository.save(entity);

        log.info("action=create_process_success process_id={} process_number={}",
            saved.getId(), saved.getProcessNumber());

        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public JudicialProcessResponse findById(Long id) {
        log.debug("action=find_process_by_id process_id={}", id);
        JudicialProcess entity = getOrThrow(id);
        return mapper.toResponse(entity);
    }

    @Transactional(readOnly = true)
    public PageResponse<JudicialProcessResponse> findAll(ProcessStatus status, String search, Pageable pageable) {
        log.debug("action=list_processes status={} search={} page={} size={}",
            status, search, pageable.getPageNumber(), pageable.getPageSize());

        Page<JudicialProcessResponse> page = repository
            .findByFilters(status, search, pageable)
            .map(mapper::toResponse);

        return PageResponse.from(page);
    }

    @Transactional
    public JudicialProcessResponse update(Long id, JudicialProcessRequest request) {
        log.info("action=update_process process_id={} process_number={}", id, request.getProcessNumber());

        JudicialProcess entity = getOrThrow(id);

        if (repository.existsByProcessNumberAndIdNot(request.getProcessNumber(), id)) {
            throw new BusinessException("DUPLICATE_PROCESS_NUMBER",
                "Já existe outro processo com o número: " + request.getProcessNumber());
        }

        validateClosingDate(request);

        mapper.updateEntityFromRequest(request, entity);
        JudicialProcess updated = repository.save(entity);

        log.info("action=update_process_success process_id={}", updated.getId());
        return mapper.toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        log.info("action=delete_process process_id={}", id);
        JudicialProcess entity = getOrThrow(id);

        if (entity.getStatus() == ProcessStatus.ACTIVE) {
            log.warn("action=delete_process_blocked reason=active_process process_id={}", id);
            throw new BusinessException("CANNOT_DELETE_ACTIVE",
                "Não é possível excluir um processo com status ATIVO. Arquive-o antes.");
        }

        repository.delete(entity);
        log.info("action=delete_process_success process_id={}", id);
    }

    private JudicialProcess getOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Processo", id));
    }

    private void validateClosingDate(JudicialProcessRequest request) {
        if (request.getClosingDate() != null && request.getOpeningDate() != null) {
            if (request.getClosingDate().isBefore(request.getOpeningDate())) {
                throw new BusinessException("INVALID_CLOSING_DATE",
                    "Data de encerramento não pode ser anterior à data de abertura");
            }
        }
    }
}
