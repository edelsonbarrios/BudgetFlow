package com.edelson.budgetflow.dtos.responses;

import java.math.BigDecimal;

public record BudgetCategoryResponse(
        Long id,
        Long budgetId,
        String name,
        BigDecimal allocatedAmount
) {}
