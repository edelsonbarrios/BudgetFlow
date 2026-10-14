package com.edelson.budgetflow.dtos.requests;

import com.edelson.budgetflow.entities.SavingsGoal;
import com.edelson.budgetflow.enums.SavingsGoalStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateSavingsGoalRequest(
        @Positive(message = "Invalid identifier value")
        Long id,

        @NotBlank(message = "Name is required")
        @Size(max = 100, min = 2)
        String name,

        @DecimalMin(message = "Enter amount above 0", value = "0.0")
        @Digits(integer = 10, fraction = 2)
        BigDecimal targetAmount,

        LocalDate targetDate,

        @NotNull(message = "Status is required")
        String status
) { }
