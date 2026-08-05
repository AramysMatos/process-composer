package com.mycompany.myapp.service;

public class EntityNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String entityName;
    private final String errorKey;

    public EntityNotFoundException(String entityName) {
        this("Entity not found", entityName, "idnotfound");
    }

    public EntityNotFoundException(String message, String entityName, String errorKey) {
        super(message);
        this.entityName = entityName;
        this.errorKey = errorKey;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getErrorKey() {
        return errorKey;
    }
}
