package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.responses.CategorySummaryResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.BudgetCategoryMapper;
import com.edelson.budgetflow.repository.BudgetCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategorySummaryService {
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final BudgetCategoryMapper budgetCategoryMapper;

    @Transactional(readOnly = true)
    public CategorySummaryResponse getBudgetCategorySummaryById(
            Long id
    ) {
        BudgetCategory category = budgetCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget category record does not exists"));

        return budgetCategoryMapper.toSummaryResponse(category);
    }
}
