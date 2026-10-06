package com.edelson.budgetflow.dtos.responses;

import com.edelson.budgetflow.enums.BudgetAlert;

import java.math.BigDecimal;

public record CategorySummaryResponse(
        Long budgetCategoryId,
        String name,
        BigDecimal allocatedAmount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        BigDecimal percentUsed,
        BudgetAlert alert
)
{ }
