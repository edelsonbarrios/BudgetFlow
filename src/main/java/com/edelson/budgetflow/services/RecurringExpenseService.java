package com.edelson.budgetflow.services;

import com.edelson.budgetflow.common.web.ClockConfig;
import com.edelson.budgetflow.dtos.requests.CreateRecurringExpenseRequest;
import com.edelson.budgetflow.dtos.responses.RecurringExpenseResponse;
import com.edelson.budgetflow.dtos.responses.RecurringMonthItemResponse;
import com.edelson.budgetflow.entities.*;
import com.edelson.budgetflow.exceptions.BusinessRuleException;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.RecurringExpenseMapper;
import com.edelson.budgetflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringExpenseService {
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final RecurringExpenseMapper recurringExpenseMapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final Clock clock;
    private final ExpenseRepository expenseRepository;

    public List<RecurringExpenseResponse> getAllRecurringExpenseByUserId(Long userId) {
        return recurringExpenseRepository.findAllByUserIdAndActiveTrue(userId)
                .stream()
                .map(recurringExpenseMapper::toResponse)
                .toList();
    }

    @Transactional
    public RecurringExpenseResponse createRecurringExpense(
            Long userId,
            CreateRecurringExpenseRequest request
    ) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User record with id '%d' could not be found"
                                .formatted(userId)
                ));

        Category category = categoryRepository.findByNameIgnoreCase(request.categoryName())
                .orElseThrow(() -> {
                    String availableCategories = String.join(",",
                            categoryRepository.findAll()
                                    .stream()
                                    .map(Category::getName)
                                    .toList()
                    );

                    return new ResourceNotFoundException(
                            "Category '%s' is invalid. Only the following categories are allowed: %s"
                                    .formatted(request.categoryName(), availableCategories)
                    );
                });

        RecurringExpense newRecurringExpense = recurringExpenseMapper.toEntity(request);
        newRecurringExpense.setUser(currentUser);
        newRecurringExpense.setCategory(category);
        RecurringExpense createRecurringExpense = recurringExpenseRepository.save(newRecurringExpense);

        return recurringExpenseMapper.toResponse(createRecurringExpense);
    }

    public List<RecurringMonthItemResponse> getMonthItems(
            Long userId,
            Long budgetId
    ) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User record could not be found"));

        Budget selectedBudget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget record could not be found"));

        if(!selectedBudget.getUser().getId().equals(currentUser.getId()))
            throw new BusinessRuleException("This budget does not belong to you");

        List<RecurringExpense> recurringExpenses = recurringExpenseRepository.findAllByUserIdAndActiveTrue(userId);

        YearMonth budgetMonth = YearMonth.of(selectedBudget.getYear(), selectedBudget.getMonth());

        Map<Long, Expense> alreadyPaidRecurringExpense = expenseRepository
                .findAllByCategoryBudgetIdAndRecurringExpenseIsNotNull(budgetId)
                .stream()
                .collect(Collectors.toMap(
                        e -> e.getRecurringExpense().getId(),
                        Function.identity(),
                        (first, second) -> first
                ));

        List<RecurringMonthItemResponse> recurringMonthItemResponses = new ArrayList<>();

        for(RecurringExpense expense : recurringExpenses) {
            LocalDate suggestedDate = budgetMonth.atDay(
                    Math.min(expense.getDueDay(), budgetMonth.lengthOfMonth())
            );

            Expense paidExpense = alreadyPaidRecurringExpense.get(expense.getId());

            recurringMonthItemResponses.add( new RecurringMonthItemResponse(
                    expense.getId(),
                    expense.getDescription(),
                    expense.getAmount(),
                    expense.getCategory().getName(),
                    suggestedDate,
                    paidExpense != null,
                    paidExpense == null ? null : paidExpense.getExpenseDate()
                    )
            );
        }

        return recurringMonthItemResponses;
    }
}
