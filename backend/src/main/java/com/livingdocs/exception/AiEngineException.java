package com.livingdocs.exception;

import org.springframework.http.HttpStatus;

public class AiEngineException extends RuntimeException {

    private final HttpStatus status;
    private final boolean retryable;

    public AiEngineException(String message, HttpStatus status, boolean retryable) {
        super(message);
        this.status = status;
        this.retryable = retryable;
    }

    public AiEngineException(String message, HttpStatus status, boolean retryable, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.retryable = retryable;
    }

    public HttpStatus getStatus() { return status; }

    public boolean isRetryable() { return retryable; }
}