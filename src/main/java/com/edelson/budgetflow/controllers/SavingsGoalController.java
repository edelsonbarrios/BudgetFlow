package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.filters.SavingsGoalFilters;
import com.edelson.budgetflow.dtos.requests.AddSavingsRequest;
import com.edelson.budgetflow.dtos.requests.CreateSavingsGoalRequest;
import com.edelson.budgetflow.dtos.responses.SavingsGoalResponse;
import com.edelson.budgetflow.services.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/savings-goal")
@RequiredArgsConstructor
public class SavingsGoalController {
    private final SavingsGoalService savingsGoalService;

    @PostMapping("/filter-goals")
    public ResponseEntity<PageResponse<SavingsGoalResponse>> filterPaginatedSavingsGoals(
           @Valid @RequestBody SavingsGoalFilters filters
    ) {
        return ResponseEntity.ok(savingsGoalService.filterPaginatedSavingsGoal(filters));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SavingsGoalResponse> createSavingsGoal(
            @Valid @RequestBody CreateSavingsGoalRequest request
            ) {
        return ResponseEntity.ok(savingsGoalService.createSavingsGoal(request));
    }

    @PatchMapping("/add-savings")
    public ResponseEntity<SavingsGoalResponse> addSavings(
           @Valid @RequestBody AddSavingsRequest request) {
        return ResponseEntity.ok(savingsGoalService.addSavings(request));
    }
}
