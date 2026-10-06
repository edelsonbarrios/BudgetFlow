package com.edelson.budgetflow.dtos.responses;

import java.math.BigDecimal;
import java.time.LocalDate;

public record  ExpenseResponse(
    Long id,
    String categoryName,
    BigDecimal amount,
    Long recurringExpenseId,
    String description,
    LocalDate expenseDate
) { }
