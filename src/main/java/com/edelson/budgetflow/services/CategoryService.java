package com.edelson.budgetflow.services;

import com.edelson.budgetflow.dtos.responses.CategoryResponse;
import com.edelson.budgetflow.entities.Category;
import com.edelson.budgetflow.mappers.CategoryMapper;
import com.edelson.budgetflow.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Cacheable("all-categories")
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
}
