package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;


public record CreateBudgetRequest(
        @Positive @NotNull @Min(1) @Max(12)Integer month,
        @NotNull @Positive Integer year,
        @NotNull @PositiveOrZero  BigDecimal totalIncome
) {}
