package com.edelson.budgetflow.dtos.requests;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AddSavingsRequest(
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
        @Digits(integer = 10, fraction = 2)
        BigDecimal amountToAdd,

        @PositiveOrZero(message = "Invalid savings goal identifier")
        Long id
) { }
