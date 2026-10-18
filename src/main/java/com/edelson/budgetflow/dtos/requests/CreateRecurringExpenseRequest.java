package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateRecurringExpenseRequest(
        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category name should not exceed 100 characters")
        String categoryName,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description should not exceed 255 characters")
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Enter an amount above 0")
        @Digits(integer = 10, fraction = 2, message = "Amount can have up to 10 digits and 2 decimal places")
        BigDecimal amount,

        @NotNull(message = "Due day is required")
        @Min(value = 1,message = "Due day must be between 1 and 31")
        @Max(value = 31, message = "Due day must be between 1 and 31")
        Integer dueDay
) { }
