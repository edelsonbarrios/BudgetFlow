package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.CreateBudgetRequest;
import com.edelson.budgetflow.dtos.requests.UpdateBudgetRequest;
import com.edelson.budgetflow.entities.Budget;
import org.mapstruct.*;
import com.edelson.budgetflow.dtos.responses.BudgetResponse;

@Mapper(componentModel = "spring",
        uses = BudgetCategoryMapper.class,
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface BudgetMapper {
    BudgetResponse toResponse(Budget budget);

    Budget toEntity(CreateBudgetRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categories", ignore = true)
    void updateEntity(UpdateBudgetRequest request, @MappingTarget Budget budget);
}
