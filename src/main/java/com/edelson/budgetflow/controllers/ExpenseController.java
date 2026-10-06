package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.requests.ExpenseRequest;
import com.edelson.budgetflow.dtos.responses.ExpenseResponse;
import com.edelson.budgetflow.services.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;

    @GetMapping("/filter-expenses/{budgetCategoryId}")
    public PageResponse<ExpenseResponse> getAllPaginatedExpensesByBudgetCategoryId(
            @PathVariable Long budgetCategoryId,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return expenseService.getAllPaginatedExpensesByBudgetCategoryId(
                budgetCategoryId,
                pageable
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ExpenseResponse> createExpense(@RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.createExpense(request));
    }
}
