package com.attus.processmanager.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super(String.format("%s com id '%s' não encontrado", resource, id));
    }
}
