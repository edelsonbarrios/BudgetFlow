package com.edelson.budgetflow.exceptions;

public class DuplicateResourceExpception extends RuntimeException{
    public DuplicateResourceExpception(String message) {
        super(message);
    }
}
