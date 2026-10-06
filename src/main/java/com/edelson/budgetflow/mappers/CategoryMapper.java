package com.edelson.budgetflow.mappers;

import com.edelson.budgetflow.dtos.responses.CategoryResponse;
import com.edelson.budgetflow.entities.Category;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}
