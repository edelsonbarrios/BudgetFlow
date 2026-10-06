package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.responses.ExpenseResponse;
import com.edelson.budgetflow.entities.Expense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR,
        uses = BudgetCategoryMapper.class
)
public interface ExpenseMapper {
    @Mapping(target = "categoryName", source = "category.category.name")
    @Mapping(target = "recurringExpenseId", source = "recurringExpense.id")
    ExpenseResponse toResponse(Expense expense);
}
