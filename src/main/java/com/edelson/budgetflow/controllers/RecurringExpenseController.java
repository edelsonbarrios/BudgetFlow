package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.dtos.requests.CreateRecurringExpenseRequest;
import com.edelson.budgetflow.dtos.responses.RecurringExpenseResponse;
import com.edelson.budgetflow.dtos.responses.RecurringMonthItemResponse;
import com.edelson.budgetflow.services.RecurringExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-expenses")
@RequiredArgsConstructor
public class RecurringExpenseController {
    private final RecurringExpenseService recurringExpenseService;

    @GetMapping("/get-all")
    public ResponseEntity<List<RecurringExpenseResponse>> getAllRecurringExpensesByUserId(
            @AuthenticationPrincipal Long userId
    )  {
        return ResponseEntity.ok(recurringExpenseService.getAllRecurringExpenseByUserId(userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RecurringExpenseResponse> createRecurringExpense(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateRecurringExpenseRequest request
            ) {
        return ResponseEntity.ok(recurringExpenseService.createRecurringExpense(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<RecurringMonthItemResponse>> getMonthlyItems(
            @AuthenticationPrincipal Long userId,
            @RequestParam Long budgetId
    ) {
        return ResponseEntity.ok(recurringExpenseService.getMonthItems(userId, budgetId));
    }
}
