package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.requests.CreateSavingsGoalRequest;
import com.edelson.budgetflow.dtos.responses.SavingsGoalResponse;
import com.edelson.budgetflow.entities.SavingsGoal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface SavingsGoalMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    SavingsGoal toEntity(CreateSavingsGoalRequest savingsGoal);

    SavingsGoalResponse toResponse(SavingsGoal savingsGoal);
}
