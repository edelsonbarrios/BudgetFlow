package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.entities.Budget;
import com.edelson.budgetflow.entities.BudgetCategory;
import com.edelson.budgetflow.entities.Category;
import com.edelson.budgetflow.exceptions.DuplicateResourceExpception;
import com.edelson.budgetflow.exceptions.ResourceNotFoundException;
import com.edelson.budgetflow.mappers.BudgetCategoryMapper;
import com.edelson.budgetflow.repository.BudgetCategoryRepository;
import com.edelson.budgetflow.repository.BudgetRepository;
import com.edelson.budgetflow.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetCategoryService {
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final BudgetCategoryMapper budgetCategoryMapper;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;

    public BudgetCategoryResponse getCategoryById(
            Long id
    ) {
        BudgetCategory budgetCategory = budgetCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget category record could not be found."
                ));

        return this.budgetCategoryMapper.toResponse(budgetCategory);
    }

    @Transactional
    public BudgetCategoryResponse createBudgetCategory(
            CreateBudgetCategoryRequest request
    ) {
        var budget = this.budgetRepository.findById(
                request.budgetId()
        ).orElseThrow(() -> new ResourceNotFoundException("Budget record does not exist."));

        var category = this.categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget category record does not exist"));

        if(this.budgetCategoryRepository.existsByBudgetIdAndCategoryId(budget.getId(), category.getId())){
            throw new DuplicateResourceExpception("Budget category %s already exists".formatted(category.getName()));
        }

        var newBudgetCategory = this.budgetCategoryMapper.toEntity(request);
        newBudgetCategory.setBudget(budget);
        newBudgetCategory.setCategory(category);

        var insertBudgetCategory = this.budgetCategoryRepository.save(newBudgetCategory);

        return this.budgetCategoryMapper.toResponse(insertBudgetCategory);
    }

    @Transactional
    public BudgetCategoryResponse updateBudgetCategory (
            Long id,
            UpdateBudgetCategoryRequest request
    ) {
        BudgetCategory budgetCategoryToUpdate = budgetCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget category record is missing"));

        Budget budget = budgetRepository.findById(request.budgetId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget reference for this category is missing"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category record does not exist"));

        boolean alreadyExists = budgetCategoryRepository.existsByBudgetIdAndCategoryIdAndIdNot(
                budget.getId(),
                category.getId(),
                id
        );

        if(alreadyExists) {
            throw new DuplicateResourceExpception("Budget category already exists");
        }

        budgetCategoryMapper.updateCategory(request, budgetCategoryToUpdate);
        budgetCategoryToUpdate.setCategory(category);
        return budgetCategoryMapper.toResponse(budgetCategoryToUpdate);
    }

    public List<BudgetCategoryResponse> getAllCategoriesByBudgetId(
            Long budgetId
    )  {
        return budgetCategoryRepository.findAllByBudgetId(budgetId)
                .stream()
                .map(budgetCategoryMapper::toResponse)
                .toList();
    }
}
