package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.services.BudgetCategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget-categories")
public class BudgetCategoryController {
    private final BudgetCategoryService budgetCategoryService;

    public BudgetCategoryController(
        BudgetCategoryService budgetCategoryService
    ) {
        this.budgetCategoryService = budgetCategoryService;
    }

    @GetMapping("/{id}")
    public BudgetCategoryResponse getBudgetCategoryById(@PathVariable Long id) {
        return budgetCategoryService.getCategoryById(id);
    }

    @PostMapping
    public BudgetCategoryResponse createBudgetCategory(@Valid @RequestBody CreateBudgetCategoryRequest request) {
        return this.budgetCategoryService.createBudgetCategory(request);
    }
}
