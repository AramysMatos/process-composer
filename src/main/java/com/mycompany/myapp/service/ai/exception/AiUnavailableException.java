package com.mycompany.myapp.service.ai.exception;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

/**
 * AI service is unavailable (disabled, misconfigured, or upstream failure).
 */
@SuppressWarnings("java:S110")
public class AiUnavailableException extends AbstractThrowableProblem {

    private static final URI TYPE = URI.create("https://www.jhipster.tech/problem/problem-with-message");

    private static final long serialVersionUID = 1L;

    private final String errorKey;

    public AiUnavailableException(String errorKey) {
        super(TYPE, errorKey, Status.SERVICE_UNAVAILABLE, null, null, null, getAlertParameters(errorKey));
        this.errorKey = errorKey;
    }

    public AiUnavailableException(String errorKey, Throwable cause) {
        super(
            TYPE,
            errorKey,
            Status.SERVICE_UNAVAILABLE,
            cause != null ? cause.getMessage() : null,
            null,
            null,
            getAlertParameters(errorKey)
        );
        this.errorKey = errorKey;
    }

    public String getErrorKey() {
        return errorKey;
    }

    private static Map<String, Object> getAlertParameters(String errorKey) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("message", errorKey);
        parameters.put("params", "ai");
        return parameters;
    }
}
