package com.edelson.budgetflow.dtos.responses;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        Integer month,
        Integer year,
        BigDecimal totalIncome
) {}