package com.edelson.budgetflow.dtos.responses;

import com.edelson.budgetflow.enums.BudgetAlert;

import java.math.BigDecimal;
import java.util.List;

public record BudgetSummaryResponse(
        Long budgetId,
        Integer month,
        Integer year,
        BigDecimal totalIncome,
        BigDecimal givenToCategories,
        BigDecimal leftToAssign,
        BigDecimal overAllocatedAmount,
        BigDecimal totalSpent,
        BigDecimal leftToSpend,
        BigDecimal percentUsed,
        BudgetAlert alert,
        List<CategorySummaryResponse> categories
        )
{ }
