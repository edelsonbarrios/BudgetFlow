package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.dtos.responses.BudgetSummaryResponse;
import com.edelson.budgetflow.dtos.responses.CategorySummaryResponse;
import com.edelson.budgetflow.services.BudgetSummaryService;
import com.edelson.budgetflow.services.CategorySummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/summary")
public class SummaryController {
    private final CategorySummaryService categorySummaryService;
    private final BudgetSummaryService budgetSummaryService;

    @GetMapping("/budget/{month}/{year}")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummaryByMonthAndYear(
            @PathVariable Integer month,
            @PathVariable Integer year
    ) {
        return ResponseEntity.ok(budgetSummaryService.getBudgetSummaryByMontAndYear(month, year));
    }

    @GetMapping("/budget-category/{id}")
    public ResponseEntity<CategorySummaryResponse> getCategorySummaryByName(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(categorySummaryService.getBudgetCategorySummaryById(id));
    }
}
