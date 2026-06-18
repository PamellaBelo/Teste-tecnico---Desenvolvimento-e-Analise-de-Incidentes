package com.attus.processmanager.mapper;

import com.attus.processmanager.dto.JudicialProcessRequest;
import com.attus.processmanager.dto.JudicialProcessResponse;
import com.attus.processmanager.model.JudicialProcess;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JudicialProcessMapper {

    JudicialProcess toEntity(JudicialProcessRequest request);

    JudicialProcessResponse toResponse(JudicialProcess entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(JudicialProcessRequest request, @MappingTarget JudicialProcess entity);
}
