package com.supermarket.bs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessReportDTO {
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private Integer totalBills = 0;
    private BigDecimal averageBillValue = BigDecimal.ZERO;
    private Integer customerCount = 0;
    private Integer newCustomersThisMonth = 0;
    private List<CategoryPerformance> topPerformingCategories = new ArrayList<>();
    private Map<String, PaymentMethodStats> paymentMethodBreakdown = new HashMap<>();
    private Map<String, BigDecimal> salesByDayOfWeek = new HashMap<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryPerformance {
        private String category;
        private BigDecimal revenue = BigDecimal.ZERO;
        private BigDecimal growth = BigDecimal.ZERO;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodStats {
        private Integer count = 0;
        private BigDecimal amount = BigDecimal.ZERO;
    }
}