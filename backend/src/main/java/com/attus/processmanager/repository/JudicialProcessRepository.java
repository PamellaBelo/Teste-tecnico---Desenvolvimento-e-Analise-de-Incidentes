package com.attus.processmanager.repository;

import com.attus.processmanager.model.JudicialProcess;
import com.attus.processmanager.model.ProcessStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JudicialProcessRepository extends JpaRepository<JudicialProcess, Long> {

    Optional<JudicialProcess> findByProcessNumber(String processNumber);

    boolean existsByProcessNumber(String processNumber);

    boolean existsByProcessNumberAndIdNot(String processNumber, Long id);

    @Query("""
        SELECT p FROM JudicialProcess p
        WHERE (:status IS NULL OR p.status = :status)
        AND (:search IS NULL OR
             LOWER(p.processNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.responsibleName) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<JudicialProcess> findByFilters(
        @Param("status") ProcessStatus status,
        @Param("search") String search,
        Pageable pageable
    );
}
