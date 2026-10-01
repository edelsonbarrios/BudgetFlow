package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;

public record CreateBudgetCategoryRequest(
        @NotNull(message = "Budget identifier is required")
        Long budgetId,
        @NotNull(message = "Name is required")
        @Size(max = 100, message = "Name should be at most 100 characters")
        String name,
        @NotNull(message = "Allocated amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Allocated amount cannot be a negative number")
        BigDecimal allocatedAmount
) { }
