package com.attus.processmanager.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProcessStatus {
    ACTIVE("Ativo"),
    SUSPENDED("Suspenso"),
    ARCHIVED("Arquivado"),
    CLOSED("Encerrado");

    private final String label;

    ProcessStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    public String name() {
        return super.name();
    }

    @JsonCreator
    public static ProcessStatus fromValue(String value) {
        for (ProcessStatus status : values()) {
            if (status.name().equalsIgnoreCase(value) || status.label.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
