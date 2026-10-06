package com.edelson.budgetflow.controllers;

import ch.qos.logback.core.pattern.util.RegularEscapeUtil;
import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.requests.CreateBudgetRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetRequest;
import com.edelson.budgetflow.dtos.responses.BudgetResponse;
import com.edelson.budgetflow.services.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    public PageResponse<BudgetResponse> filterBudgets(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size, Sort sort) {
        Pageable pageable = PageRequest.of(
                page - 1,
                size,
                Sort.by(Sort.Order.asc("year"), Sort.Order.asc("month"))
        );
        return  budgetService.filterBudgetsByMonthAndYear(month, year, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody CreateBudgetRequest request) {
        return ResponseEntity.ok(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request
            ) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(budgetService.getBudgetById(id));
    }
}
