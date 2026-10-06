package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "Budget category identifier is requireqd")
        @Positive(message = "Invalid budget category identifier value")
        Long budgetCategoryId,
        @Positive(message = "Invalid recurring expense identifier")
        Long recurringExpenseId,
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Allocated amount cannot be a negative number")
        BigDecimal amount,
        @Size(max = 255)
        String description
) { }
