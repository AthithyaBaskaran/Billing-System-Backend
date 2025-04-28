package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    private final ReportService reportService;
    
    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }
    
    /**
     * Generate a report for all customers
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ResponseEntity containing the customer report for all customers for all customers
     */
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse> getAllCustomersReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        ApiResponse response = reportService.generateCustomerReport(startDate, endDate);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Generate a report for a specific customer
     * 
     * @param customerId ID of the customer
     * @return ResponseEntity containing the customer report for the specified customer
     */
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<ApiResponse> getCustomerReport(@PathVariable Long customerId) {
        ApiResponse response = reportService.generateCustomerReportById(customerId, null, null);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Generate a report for all products
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ResponseEntity containing the product report for all products
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse> getAllProductsReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        ApiResponse response = reportService.generateProductReport(startDate, endDate);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Generate a report for a specific product
     * 
     * @param productId ID of the product
     * @return ResponseEntity containing the product report for the specified product
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiResponse> getProductReport(@PathVariable Long productId) {
        ApiResponse response = reportService.generateProductReportById(productId, null, null);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Generate a business overview report
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ResponseEntity containing the business report
     */
    @GetMapping("/business")
    public ResponseEntity<ApiResponse> getBusinessReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        ApiResponse response = reportService.generateBusinessReport(startDate, endDate);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}