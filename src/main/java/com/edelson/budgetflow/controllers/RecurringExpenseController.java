package com.edelson.budgetflow.controllers;

import com.edelson.budgetflow.dtos.responses.RecurringExpenseResponse;
import com.edelson.budgetflow.services.RecurringExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
