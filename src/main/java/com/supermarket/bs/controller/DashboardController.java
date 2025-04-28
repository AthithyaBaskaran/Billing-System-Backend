package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/counts")
    public ResponseEntity<ApiResponse> getAllCounts() {
        Map<String, Object> counts = dashboardService.getCountsSummary();
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "All counts fetched successfully",
                counts
        );
        
        return ResponseEntity.ok(response);
    }
}