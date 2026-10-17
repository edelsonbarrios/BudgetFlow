package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.responses.RecurringExpenseResponse;
import com.edelson.budgetflow.entities.RecurringExpense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface RecurringExpenseMapper {
    @Mapping(target = "categoryName", source = "category.name")
    RecurringExpenseResponse toResponse(RecurringExpense expense);
}
