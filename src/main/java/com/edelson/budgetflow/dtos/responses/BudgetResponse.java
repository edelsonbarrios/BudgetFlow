package com.edelson.budgetflow.dtos.responses;

import java.math.BigDecimal;
import java.util.List;

public record BudgetResponse(
        Long id,
        Integer month,
        Integer year,
        BigDecimal totalIncome,
        List<BudgetCategoryResponse> categories,
        BigDecimal leftToAssign,
        BigDecimal givenToCategories,
        BigDecimal overAllocatedAmount
) {}