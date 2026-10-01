package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.exceptions.DuplicateResourceExpception;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.BudgetCategoryMapper;
import com.edelson.budgetflow.repository.BudgetCategoryRepository;
import com.edelson.budgetflow.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BudgetCategoryService {
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final BudgetCategoryMapper budgetCategoryMapper;
    private final BudgetRepository budgetRepository;

    public BudgetCategoryResponse getCategoryById(
            Long id
    ) {
        BudgetCategory budgetCategory = budgetCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget category record could not be found."
                ));

        return this.budgetCategoryMapper.toResponse(budgetCategory);
    }

    public BudgetCategoryResponse createBudgetCategory(
            CreateBudgetCategoryRequest request
    ) {
        var budget = this.budgetRepository.findById(
                request.budgetId()
        ).orElseThrow(() -> new ResourceNotFoundException("Budget record does not exist."));

        if(this.budgetCategoryRepository.existsByBudgetIdAndNameIgnoreCase(budget.getId(), request.name().trim())){
            throw new DuplicateResourceExpception("Budget category %s already exists".formatted(request.name()));
        }

        var newBudgetCategory = this.budgetCategoryMapper.toEntity(request);
        newBudgetCategory.setBudget(budget);

        var insertBudgetCategory = this.budgetCategoryRepository.save(newBudgetCategory);

        return this.budgetCategoryMapper.toResponse(insertBudgetCategory);
    }
}
