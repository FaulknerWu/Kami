package fun.faulkner.kami.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private static final String VALIDATION_FAILED_DETAIL = "Request validation failed";
    private static final String MALFORMED_REQUEST_DETAIL = "Request body is malformed";
    private static final String INTERNAL_SERVER_ERROR_DETAIL = "Unexpected server error";

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException exception, WebRequest request) {
        ProblemDetail problemDetail = createProblemDetail(exception, HttpStatus.BAD_REQUEST, exception.getMessage(), request);
        return handleExceptionInternal(exception, problemDetail, HttpHeaders.EMPTY, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException exception, WebRequest request) {
        ProblemDetail problemDetail = createProblemDetail(exception, HttpStatus.BAD_REQUEST, VALIDATION_FAILED_DETAIL, request);
        problemDetail.setProperty("errors", extractConstraintViolations(exception));
        return handleExceptionInternal(exception, problemDetail, HttpHeaders.EMPTY, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpectedException(Exception exception, WebRequest request) {
        ProblemDetail problemDetail = createProblemDetail(exception, HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_DETAIL, request);
        return handleExceptionInternal(exception, problemDetail, HttpHeaders.EMPTY, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        ProblemDetail problemDetail = createProblemDetail(exception, status, VALIDATION_FAILED_DETAIL, request);
        problemDetail.setProperty("errors", extractBindingErrors(exception.getBindingResult()));
        return handleExceptionInternal(exception, problemDetail, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        ProblemDetail problemDetail = createProblemDetail(exception, status, VALIDATION_FAILED_DETAIL, request);
        problemDetail.setProperty("errors", extractParameterValidationErrors(exception));
        return handleExceptionInternal(exception, problemDetail, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        ProblemDetail problemDetail = createProblemDetail(exception, status, MALFORMED_REQUEST_DETAIL, request);
        return handleExceptionInternal(exception, problemDetail, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request
    ) {
        if (body instanceof ProblemDetail problemDetail) {
            enrichProblemDetail(problemDetail, request);
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private ProblemDetail createProblemDetail(Exception exception, HttpStatusCode status, String detail, WebRequest request) {
        ProblemDetail problemDetail = super.createProblemDetail(exception, status, detail, null, null, request);
        problemDetail.setTitle(HttpStatus.valueOf(status.value()).getReasonPhrase());
        return problemDetail;
    }

    private void enrichProblemDetail(ProblemDetail problemDetail, WebRequest request) {
        problemDetail.setProperty("timestamp", LocalDateTime.now());

        if (request instanceof ServletWebRequest servletWebRequest) {
            problemDetail.setProperty("path", servletWebRequest.getRequest().getRequestURI());
        }
    }

    private List<ValidationErrorItem> extractBindingErrors(BindingResult bindingResult) {
        List<ValidationErrorItem> errors = new ArrayList<>();

        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            errors.add(new ValidationErrorItem(fieldError.getField(), resolveValidationMessage(fieldError)));
        }

        for (ObjectError globalError : bindingResult.getGlobalErrors()) {
            errors.add(new ValidationErrorItem(globalError.getObjectName(), resolveValidationMessage(globalError)));
        }

        return errors;
    }

    private List<ValidationErrorItem> extractParameterValidationErrors(HandlerMethodValidationException exception) {
        List<ValidationErrorItem> errors = new ArrayList<>();

        for (ParameterValidationResult validationResult : exception.getParameterValidationResults()) {
            String parameterName = validationResult.getMethodParameter().getParameterName();

            if (validationResult instanceof ParameterErrors parameterErrors) {
                for (FieldError fieldError : parameterErrors.getFieldErrors()) {
                    errors.add(new ValidationErrorItem(parameterName + "." + fieldError.getField(), resolveValidationMessage(fieldError)));
                }

                for (ObjectError globalError : parameterErrors.getGlobalErrors()) {
                    errors.add(new ValidationErrorItem(parameterName, resolveValidationMessage(globalError)));
                }
                continue;
            }

            validationResult.getResolvableErrors().forEach(error ->
                    errors.add(new ValidationErrorItem(parameterName, resolveValidationMessage(error)))
            );
        }

        return errors;
    }

    private List<ValidationErrorItem> extractConstraintViolations(ConstraintViolationException exception) {
        return exception.getConstraintViolations().stream()
                .map(this::toValidationErrorItem)
                .toList();
    }

    private ValidationErrorItem toValidationErrorItem(ConstraintViolation<?> violation) {
        return new ValidationErrorItem(
                violation.getPropertyPath().toString(),
                violation.getMessage()
        );
    }

    private String resolveValidationMessage(MessageSourceResolvable error) {
        return error.getDefaultMessage() != null ? error.getDefaultMessage() : "Validation failed";
    }

    private record ValidationErrorItem(String target, String message) {
    }
}
