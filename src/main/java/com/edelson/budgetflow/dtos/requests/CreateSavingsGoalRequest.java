package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSavingsGoalRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name should not exceed 50 characters")
    String name,

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Target amount must be greater than zero")
    BigDecimal targetAmount,

    @DecimalMin(value = "0.0", message = "Current amount must be greater than zero")
    @Digits(integer = 10, fraction = 2)
    BigDecimal currentAmount,

    @NotNull(message = "Target date is required")
    @FutureOrPresent(message = "Target date must be today or in the future")
    LocalDate targetDate
) { }
