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
public class CustomerReportDTO {
    private List<CustomerAnalytics> customerAnalytics = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerAnalytics {
        private Long customerId;
        private String customerName;
        private BigDecimal totalSpending = BigDecimal.ZERO;
        private Integer purchaseCount = 0;
        private BigDecimal averageBillAmount = BigDecimal.ZERO;
        private List<ProductPurchase> mostPurchasedProducts = new ArrayList<>();
        private Map<String, BigDecimal> monthlySpending = new HashMap<>();
        private Integer loyaltyPoints = 0;
        private Integer customerRank = 0;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPurchase {
        private Long productId;
        private String productName;
        private Integer purchaseCount = 0;
    }
}