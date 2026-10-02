package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.services.BudgetCategoryService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BudgetCategoryResponse> createBudgetCategory(@Valid @RequestBody CreateBudgetCategoryRequest request) {
        return ResponseEntity.ok(budgetCategoryService.createBudgetCategory(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetCategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetCategoryRequest request
            ) {
        return ResponseEntity.ok(budgetCategoryService.updateBudgetCategory(id, request));
    }

    @GetMapping("/budget/{budgetId}")
    public ResponseEntity<List<BudgetCategoryResponse>> getCategoriesByBudgetId(
            @PathVariable Integer budgetId
    ) {
        return ResponseEntity.ok(budgetCategoryService.getAllCategoriesByBudgetId(budgetId));
    }
}
