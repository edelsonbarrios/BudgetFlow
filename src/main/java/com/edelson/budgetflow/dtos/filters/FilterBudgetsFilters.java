package com.edelson.budgetflow.dtos.filters;

import jakarta.validation.constraints.Positive;

public record FilterBudgetsFilters(
    @Positive
    Integer month,

    @Positive
    Integer year,

    @Positive
    int page,

    @Positive
    int size
)
{ }
