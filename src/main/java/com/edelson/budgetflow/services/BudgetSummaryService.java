package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.responses.BudgetSummaryResponse;
import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.BudgetMapper;
import com.edelson.budgetflow.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetSummaryService {
    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummaryByMontAndYear(
            Integer month,
            Integer year,
            Long userId
    ) {
        Budget budget = budgetRepository.findByYearAndMonthAndUserId(year, month, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget for %d/%d does not exists".formatted(month, year)));

        return budgetMapper.toSummaryResponse(budget);
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getSummaryById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget record does not exist."));

        return budgetMapper.toSummaryResponse(budget);
    }

}
