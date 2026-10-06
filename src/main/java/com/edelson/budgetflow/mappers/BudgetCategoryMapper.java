package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BudgetCategoryMapper {

    @Mapping(target = "budgetId", source = "budget.id")
    @Mapping(target = "name", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    BudgetCategoryResponse toResponse(BudgetCategory category);

    BudgetCategory toEntity(CreateBudgetCategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "budget", ignore = true)
    void updateCategory(UpdateBudgetCategoryRequest request, @MappingTarget BudgetCategory category);
}
