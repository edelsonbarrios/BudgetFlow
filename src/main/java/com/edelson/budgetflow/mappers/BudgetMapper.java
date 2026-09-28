package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetRequest;
import com.edelson.budgetflow.entities.Budget;
import org.mapstruct.Mapper;
import com.edelson.budgetflow.dtos.responses.BudgetResponse;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BudgetMapper {
    BudgetResponse toResponse(Budget budget);

    Budget toEntity(CreateBudgetRequest request);
}
