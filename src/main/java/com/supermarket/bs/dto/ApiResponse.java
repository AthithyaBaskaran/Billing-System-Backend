package com.supermarket.bs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<S> {
    private int statusCode;
    private String statusMessage;
    private Object data;
}