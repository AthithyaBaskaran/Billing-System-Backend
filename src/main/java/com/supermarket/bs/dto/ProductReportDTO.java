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
public class ProductReportDTO {
    private List<ProductSalesByQuantity> topSellingByQuantity = new ArrayList<>();
    private List<ProductSalesByRevenue> topSellingByRevenue = new ArrayList<>();
    private List<CategorySales> categorySales = new ArrayList<>();
    private Map<String, MonthlySales> monthlySalesTrend = new HashMap<>();
    private List<CustomerPreference> customerPreferences = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSalesByQuantity {
        private Long productId;
        private String productName;
        private Integer totalQuantitySold = 0;
        private BigDecimal percentageOfTotalSales = BigDecimal.ZERO;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSalesByRevenue {
        private Long productId;
        private String productName;
        private BigDecimal totalRevenue = BigDecimal.ZERO;
        private BigDecimal percentageOfTotalRevenue = BigDecimal.ZERO;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySales {
        private String category;
        private BigDecimal totalSales = BigDecimal.ZERO;
        private Integer itemsSold = 0;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySales {
        private BigDecimal totalSales = BigDecimal.ZERO;
        private Integer itemsSold = 0;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerPreference {
        private Long productId;
        private String productName;
        private Integer uniqueCustomers = 0;
        private BigDecimal repeatPurchaseRate = BigDecimal.ZERO;
    }
}