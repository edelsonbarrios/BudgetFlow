package com.edelson.budgetflow.dtos.responses;

import java.math.BigDecimal;

public record RecurringExpenseResponse(
        Long id,
        String categoryName,
        String description,
        BigDecimal amount,
        Integer dueDay,
        Boolean active
) { }
