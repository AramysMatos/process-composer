package com.mycompany.myapp.service.ai.exception;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

/**
 * Daily AI token quota exceeded for user or platform.
 */
@SuppressWarnings("java:S110")
public class AiQuotaExceededException extends AbstractThrowableProblem {

    private static final URI TYPE = URI.create("https://www.jhipster.tech/problem/problem-with-message");

    private static final long serialVersionUID = 1L;

    private final String errorKey;

    public AiQuotaExceededException(String errorKey) {
        super(TYPE, errorKey, Status.TOO_MANY_REQUESTS, null, null, null, getAlertParameters(errorKey));
        this.errorKey = errorKey;
    }

    public String getErrorKey() {
        return errorKey;
    }

    private static Map<String, Object> getAlertParameters(String errorKey) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("message", "ai.quota.exceeded");
        parameters.put("params", "ai");
        parameters.put("errorKey", errorKey);
        return parameters;
    }
}
