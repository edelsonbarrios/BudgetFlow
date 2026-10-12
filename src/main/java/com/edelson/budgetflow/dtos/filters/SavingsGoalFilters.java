package com.edelson.budgetflow.dtos.filters;

import com.edelson.budgetflow.enums.SavingsGoalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record SavingsGoalFilters(
        @Size(max = 100, message = "Search text must not exceed 100 characters")
        String searchQuery,

        String status,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate targetDate,

        @Positive(message = "Invalid page number value")
        int page,

        @Positive(message = "Invalid page size value")
        @Max(value = 10, message = "Page size must not exceed 10")
        int size
) { }
