package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;

public record UpdateBudgetCategoryRequest(
        @NotNull(message = "Budget reference is required")
        @Positive(message = "Invalid budget identifier value")
        Long budgetId,
        @NotNull(message = "Name is required")
        @Size(message = "Name must not exceed 100 characters")
        String name,
        @NotNull(message = "Allocated amount is required")
        @PositiveOrZero(message = "Invalid amount")
        BigDecimal allocatedAmount
) { }
