package com.edelson.budgetflow.controllers;

import ch.qos.logback.core.pattern.util.RegularEscapeUtil;
import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.filters.FilterBudgetsFilters;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping("filter-by-user")
    public PageResponse<BudgetResponse> filterBudgets(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody FilterBudgetsFilters request) {
        Pageable pageable = PageRequest.of(
                request.page() - 1,
                request.size(),
                Sort.by(Sort.Order.asc("year"), Sort.Order.asc("month"))
        );
        return  budgetService.filterBudgetsByMonthAndYear(request.month(),
                request.year(),
                pageable,
                userId
                );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BudgetResponse> createBudget(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateBudgetRequest request) {
        return ResponseEntity.ok(budgetService.createBudget(userId, request));
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
