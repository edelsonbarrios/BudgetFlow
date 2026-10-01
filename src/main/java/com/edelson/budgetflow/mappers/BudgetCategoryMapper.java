package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetCategoryRequest;
import com.edelson.budgetflow.dtos.responses.BudgetCategoryResponse;
import com.edelson.budgetflow.entities.BudgetCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BudgetCategoryMapper {

    @Mapping(target = "budgetId", source = "budget.id")
    BudgetCategoryResponse toResponse(BudgetCategory category);

    BudgetCategory toEntity(CreateBudgetCategoryRequest request);
}
