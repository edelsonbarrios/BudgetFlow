package com.edelson.budgetflow.dtos.responses;

import com.edelson.budgetflow.enums.SavingsGoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        BigDecimal remainingAmount,
        BigDecimal percentAmount,
        boolean completed,
        boolean overdue,
        LocalDate targetDate,
        SavingsGoalStatus status
) { }
