package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.ExpenseRequest;
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

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "recurringExpense", ignore = true)
    @Mapping(target = "expenseDate", ignore = true)
    Expense toEntity(ExpenseRequest request);
}
