package com.edelson.budgetflow.dtos.responses;

import com.edelson.budgetflow.enums.RecurringStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringMonthItemResponse(
        Long recurringExpenseId,
        String description,
        BigDecimal amount,
        String categoryName,
        LocalDate suggestedDate,
        boolean paid,
        LocalDate paidDate
) { }
