package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;


public record CreateBudgetRequest(
        @NotNull(message = "Month is required")
        @Min(value = 1, message = "Month value should be greater than 0")
        @Max(value = 12, message = "Month value should only be between 1 to 12")
        Integer month,

        @NotNull(message = "Year is required")
        @Positive(message = "Year value should be greater than 0")
        Integer year,

        @NotNull(message = "Total income is required")
        @PositiveOrZero(message = "Total income value cannot be a negative number")
        BigDecimal totalIncome,

        @Positive(message = "User identifier is missing")
        Long userId
) {}
