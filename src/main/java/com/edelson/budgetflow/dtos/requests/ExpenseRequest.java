package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "Budget category identifier is required")
        @Positive(message = "Invalid budget category identifier value")
        Long budgetCategoryId,
        @Positive(message = "Invalid recurring expense identifier")
        Long recurringExpenseId,
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Enter an amount above 0")
        @Digits(integer = 10, fraction = 2)
        BigDecimal amount,
        @Size(max = 255, message = "Description should not exceed 255 characters")
        String description,
        LocalDate expenseDate
) { }
