package com.edelson.budgetflow.services;

import com.edelson.budgetflow.common.web.PageResponse;
import com.edelson.budgetflow.dtos.requests.ExpenseRequest;
import com.edelson.budgetflow.dtos.responses.ExpenseResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.entities.Expense;
import com.edelson.budgetflow.entities.RecurringExpense;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.ExpenseMapper;
import com.edelson.budgetflow.repository.BudgetCategoryRepository;
import com.edelson.budgetflow.repository.ExpenseRepository;
import com.edelson.budgetflow.repository.RecurringExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;

    public PageResponse<ExpenseResponse> getAllPaginatedExpensesByBudgetCategoryId(
            Long budgetCategoryId,
            Pageable pageable
    ) {
        BudgetCategory budgetCategory = budgetCategoryRepository.findById(
                budgetCategoryId
        ).orElseThrow(() -> new ResourceNotFoundException("Budget category record does not exists"));

        Page<Expense> expenses = expenseRepository.findAllByCategoryId(budgetCategoryId, pageable);

        return PageResponse.from(expenses.map(expenseMapper::toResponse));
    }

    public ExpenseResponse createExpense(
            ExpenseRequest request
    ) {
        BudgetCategory budgetCategory = budgetCategoryRepository.findById(request.budgetCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget category record does not exists"));

        RecurringExpense recurringExpense = null;

        if(request.recurringExpenseId() != null) {
            recurringExpense = recurringExpenseRepository.findById(request.recurringExpenseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recurring expense record does not exists"));
        }

        Expense newExpense = expenseMapper.toEntity(request);
        newExpense.setRecurringExpense(recurringExpense);

        newExpense.setExpenseDate(LocalDate.now());
        newExpense.setCategory(budgetCategory);
        newExpense.setRecurringExpense(recurringExpense);

        Expense createExpense = expenseRepository.save(newExpense);

        return expenseMapper.toResponse(createExpense);
    }
}
