package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.BusinessReportDTO;
import com.supermarket.bs.dto.CustomerReportDTO;
import com.supermarket.bs.dto.ProductReportDTO;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.CustomerRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Autowired
    public ReportService(BillRepository billRepository, CustomerRepository customerRepository, ProductRepository productRepository) {
        this.billRepository = billRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    /**
     * Generate a comprehensive customer analytics report
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ApiResponse containing the customer report
     */
    public ApiResponse generateCustomerReport(LocalDate startDate, LocalDate endDate) {
        try {
            List<Customer> customers = customerRepository.findAll();
            List<Bill> allBills;
            
            // Apply date filtering if provided
            if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
                allBills = billRepository.findByBillDateBetween(startDateTime, endDateTime);
            } else {
                allBills = billRepository.findAll();
            }
            
            if (allBills.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No bills found for the specified period",
                        null
                );
            }
            
            CustomerReportDTO report = new CustomerReportDTO();
            
            // Group bills by customer
            Map<Customer, List<Bill>> billsByCustomer = allBills.stream()
                    .filter(bill -> bill.getCustomer() != null)
                    .collect(Collectors.groupingBy(Bill::getCustomer));
            
            // Calculate total spending across all customers for ranking
            List<Map.Entry<Customer, BigDecimal>> customerSpending = new ArrayList<>();
            
            for (Map.Entry<Customer, List<Bill>> entry : billsByCustomer.entrySet()) {
                Customer customer = entry.getKey();
                List<Bill> customerBills = entry.getValue();
                
                BigDecimal totalSpent = customerBills.stream()
                        .map(Bill::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                customerSpending.add(new AbstractMap.SimpleEntry<>(customer, totalSpent));
            }
            
            // Sort customers by total spending for ranking
            customerSpending.sort((e1, e2) -> e2.getValue().compareTo(e1.getValue()));
            
            // Process each customer
            for (int i = 0; i < customerSpending.size(); i++) {
                Customer customer = customerSpending.get(i).getKey();
                List<Bill> customerBills = billsByCustomer.get(customer);
                
                CustomerReportDTO.CustomerAnalytics analytics = createCustomerAnalytics(customer, customerBills, i + 1);
                report.getCustomerAnalytics().add(analytics);
            }
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Customer report generated successfully",
                    report
            );
            
        } catch (Exception e) {
            return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error generating customer report: " + e.getMessage(),
                    null
            );
        }
    }
    
    /**
     * Generate a report for a specific customer by ID
     * 
     * @param customerId ID of the customer
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ApiResponse containing the customer report for the specified customer
     */
    public ApiResponse generateCustomerReportById(Long customerId, LocalDate startDate, LocalDate endDate) {
        try {
            Optional<Customer> customerOptional = customerRepository.findById(customerId);
            if (!customerOptional.isPresent()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "Customer not found with id: " + customerId,
                        null
                );
            }
            
            Customer customer = customerOptional.get();
            List<Bill> customerBills;
            
            // Apply date filtering if provided
            if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
                customerBills = billRepository.findByCustomerAndBillDateBetween(customer, startDateTime, endDateTime);
            } else {
                customerBills = billRepository.findByCustomer(customer);
            }
            
            if (customerBills.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No bills found for customer with id: " + customerId,
                        null
                );
            }
            
            CustomerReportDTO report = new CustomerReportDTO();
            
            // Create customer analytics
            CustomerReportDTO.CustomerAnalytics analytics = createCustomerAnalytics(customer, customerBills, 1);
            report.getCustomerAnalytics().add(analytics);
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Customer report generated successfully for customer: " + customer.getFirstName() + " " + customer.getLastName(),
                    report
            );
            
        } catch (Exception e) {
            return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error generating customer report: " + e.getMessage(),
                    null
            );
        }
    }
    
    /**
     * Helper method to create customer analytics
     */
    private CustomerReportDTO.CustomerAnalytics createCustomerAnalytics(Customer customer, List<Bill> customerBills, int rank) {
        CustomerReportDTO.CustomerAnalytics analytics = new CustomerReportDTO.CustomerAnalytics();
        analytics.setCustomerId(customer.getId());
        analytics.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        
        BigDecimal totalSpent = customerBills.stream()
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        analytics.setTotalSpending(totalSpent);
        analytics.setPurchaseCount(customerBills.size());
        analytics.setLoyaltyPoints(customer.getLoyaltyPoints());
        analytics.setCustomerRank(rank);
        
        // Calculate average bill amount
        if (!customerBills.isEmpty()) {
            analytics.setAverageBillAmount(
                    totalSpent.divide(new BigDecimal(customerBills.size()), 2, RoundingMode.HALF_UP)
            );
        }
        
        // Calculate monthly spending
        Map<String, BigDecimal> monthlySpending = new HashMap<>();
        for (Bill bill : customerBills) {
            String yearMonth = bill.getBillDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            monthlySpending.merge(yearMonth, bill.getTotalAmount(), BigDecimal::add);
        }
        analytics.setMonthlySpending(monthlySpending);
        
        // Find most purchased products
        Map<Product, Integer> productCounts = new HashMap<>();
        for (Bill bill : customerBills) {
            for (BillItem item : bill.getItems()) {
                productCounts.merge(item.getProduct(), item.getQuantity(), Integer::sum);
            }
        }
        
        // Sort products by purchase count
        List<Map.Entry<Product, Integer>> sortedProducts = new ArrayList<>(productCounts.entrySet());
        sortedProducts.sort((e1, e2) -> e2.getValue().compareTo(e1.getValue()));
        
        // Take top 5 most purchased products
        for (int j = 0; j < Math.min(5, sortedProducts.size()); j++) {
            Map.Entry<Product, Integer> entry = sortedProducts.get(j);
            Product product = entry.getKey();
            Integer count = entry.getValue();
            
            CustomerReportDTO.ProductPurchase productPurchase = new CustomerReportDTO.ProductPurchase();
            productPurchase.setProductId(product.getId());
            productPurchase.setProductName(product.getName());
            productPurchase.setPurchaseCount(count);
            
            analytics.getMostPurchasedProducts().add(productPurchase);
        }
        
        return analytics;
    }
    
    /**
     * Generate a comprehensive product analytics report
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ApiResponse containing the product report
     */
    public ApiResponse generateProductReport(LocalDate startDate, LocalDate endDate) {
        try {
            List<Bill> allBills;
            
            // Apply date filtering if provided
            if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
                allBills = billRepository.findByBillDateBetween(startDateTime, endDateTime);
            } else {
                allBills = billRepository.findAll();
            }
            
            if (allBills.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No bills found for the specified period",
                        null
                );
            }
            
            ProductReportDTO report = new ProductReportDTO();
            
            // Extract all bill items
            List<BillItem> allItems = allBills.stream()
                    .flatMap(bill -> bill.getItems().stream())
                    .collect(Collectors.toList());
            
            // Calculate total quantity sold and revenue for each product
            Map<Product, Integer> quantitySoldByProduct = new HashMap<>();
            Map<Product, BigDecimal> revenueByProduct = new HashMap<>();
            
            for (BillItem item : allItems) {
                Product product = item.getProduct();
                Integer quantity = item.getQuantity();
                BigDecimal lineTotal = item.getLineTotal();
                
                quantitySoldByProduct.merge(product, quantity, Integer::sum);
                revenueByProduct.merge(product, lineTotal, BigDecimal::add);
            }
            
            // Calculate total quantity and revenue across all products
            int totalQuantitySold = quantitySoldByProduct.values().stream().mapToInt(Integer::intValue).sum();
            BigDecimal totalRevenue = revenueByProduct.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Sort products by quantity sold
            List<Map.Entry<Product, Integer>> productsByQuantity = new ArrayList<>(quantitySoldByProduct.entrySet());
            productsByQuantity.sort((e1, e2) -> e2.getValue().compareTo(e1.getValue()));
            
            // Top products by quantity
            for (int i = 0; i < Math.min(10, productsByQuantity.size()); i++) {
                Map.Entry<Product, Integer> entry = productsByQuantity.get(i);
                Product product = entry.getKey();
                Integer quantity = entry.getValue();
                
                ProductReportDTO.ProductSalesByQuantity productSales = new ProductReportDTO.ProductSalesByQuantity();
                productSales.setProductId(product.getId());
                productSales.setProductName(product.getName());
                productSales.setTotalQuantitySold(quantity);
                
                // Calculate percentage of total sales
                if (totalQuantitySold > 0) {
                    BigDecimal percentage = new BigDecimal(quantity)
                            .multiply(new BigDecimal("100"))
                            .divide(new BigDecimal(totalQuantitySold), 2, RoundingMode.HALF_UP);
                    productSales.setPercentageOfTotalSales(percentage);
                }
                
                report.getTopSellingByQuantity().add(productSales);
            }
            
            // Sort products by revenue
            List<Map.Entry<Product, BigDecimal>> productsByRevenue = new ArrayList<>(revenueByProduct.entrySet());
            productsByRevenue.sort((e1, e2) -> e2.getValue().compareTo(e1.getValue()));
            
            // Top products by revenue
            for (int i = 0; i < Math.min(10, productsByRevenue.size()); i++) {
                Map.Entry<Product, BigDecimal> entry = productsByRevenue.get(i);
                Product product = entry.getKey();
                BigDecimal revenue = entry.getValue();
                
                ProductReportDTO.ProductSalesByRevenue productSales = new ProductReportDTO.ProductSalesByRevenue();
                productSales.setProductId(product.getId());
                productSales.setProductName(product.getName());
                productSales.setTotalRevenue(revenue);
                
                // Calculate percentage of total revenue
                if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentage = revenue
                            .multiply(new BigDecimal("100"))
                            .divide(totalRevenue, 2, RoundingMode.HALF_UP);
                    productSales.setPercentageOfTotalRevenue(percentage);
                }
                
                report.getTopSellingByRevenue().add(productSales);
            }
            
            // Category sales
            Map<String, ProductReportDTO.CategorySales> categorySalesMap = new HashMap<>();
            
            for (BillItem item : allItems) {
                Product product = item.getProduct();
                String category = product.getCategory();
                
                if (category == null || category.isEmpty()) {
                    category = "Uncategorized";
                }
                
                ProductReportDTO.CategorySales categorySales = categorySalesMap.computeIfAbsent(
                        category, k -> new ProductReportDTO.CategorySales()
                );
                
                categorySales.setCategory(category);
                categorySales.setItemsSold(categorySales.getItemsSold() + item.getQuantity());
                categorySales.setTotalSales(categorySales.getTotalSales().add(item.getLineTotal()));
            }
            
            // Sort categories by total sales
            List<ProductReportDTO.CategorySales> sortedCategories = new ArrayList<>(categorySalesMap.values());
            sortedCategories.sort((c1, c2) -> c2.getTotalSales().compareTo(c1.getTotalSales()));
            report.setCategorySales(sortedCategories);
            
            // Monthly sales trend
            Map<String, ProductReportDTO.MonthlySales> monthlySalesMap = new HashMap<>();
            
            for (Bill bill : allBills) {
                String yearMonth = bill.getBillDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                
                ProductReportDTO.MonthlySales monthlySales = monthlySalesMap.computeIfAbsent(
                        yearMonth, k -> new ProductReportDTO.MonthlySales()
                );
                
                monthlySales.setTotalSales(monthlySales.getTotalSales().add(bill.getTotalAmount()));
                
                int itemsInBill = bill.getItems().stream()
                        .mapToInt(BillItem::getQuantity)
                        .sum();
                
                monthlySales.setItemsSold(monthlySales.getItemsSold() + itemsInBill);
            }
            
            report.setMonthlySalesTrend(monthlySalesMap);
            
            // Customer preferences
            Map<Product, Set<Customer>> customersByProduct = new HashMap<>();
            Map<Product, Map<Customer, Integer>> purchaseCountByCustomerAndProduct = new HashMap<>();
            
            for (Bill bill : allBills) {
                Customer customer = bill.getCustomer();
                if (customer == null) continue;
                
                for (BillItem item : bill.getItems()) {
                    Product product = item.getProduct();
                    
                    // Track unique customers per product
                    Set<Customer> customers = customersByProduct.computeIfAbsent(
                            product, k -> new HashSet<>()
                    );
                    customers.add(customer);
                    
                    // Track purchase count by customer and product
                    Map<Customer, Integer> purchaseCountByCustomer = purchaseCountByCustomerAndProduct.computeIfAbsent(
                            product, k -> new HashMap<>()
                    );
                    purchaseCountByCustomer.merge(customer, 1, Integer::sum);
                }
            }
            
            // Calculate customer preferences
            for (Map.Entry<Product, Set<Customer>> entry : customersByProduct.entrySet()) {
                Product product = entry.getKey();
                Set<Customer> customers = entry.getValue();
                Map<Customer, Integer> purchaseCounts = purchaseCountByCustomerAndProduct.get(product);
                
                ProductReportDTO.CustomerPreference preference = new ProductReportDTO.CustomerPreference();
                preference.setProductId(product.getId());
                preference.setProductName(product.getName());
                preference.setUniqueCustomers(customers.size());
                
                // Calculate repeat purchase rate
                if (!customers.isEmpty()) {
                    long repeatCustomers = purchaseCounts.values().stream()
                            .filter(count -> count > 1)
                            .count();
                    
                    BigDecimal repeatRate = new BigDecimal(repeatCustomers)
                            .divide(new BigDecimal(customers.size()), 2, RoundingMode.HALF_UP);
                    
                    preference.setRepeatPurchaseRate(repeatRate);
                }
                
                report.getCustomerPreferences().add(preference);
            }
            
            // Sort customer preferences by unique customers
            report.getCustomerPreferences().sort((p1, p2) -> p2.getUniqueCustomers().compareTo(p1.getUniqueCustomers()));
            
            // Limit to top 10
            if (report.getCustomerPreferences().size() > 10) {
                report.setCustomerPreferences(report.getCustomerPreferences().subList(0, 10));
            }
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Product report generated successfully",
                    report
            );
            
        } catch (Exception e) {
            return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error generating product report: " + e.getMessage(),
                    null
            );
        }
    }
    
    /**
     * Generate a report for a specific product by ID
     * 
     * @param productId ID of the product
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ApiResponse containing the product report for the specified product
     */
    public ApiResponse generateProductReportById(Long productId, LocalDate startDate, LocalDate endDate) {
        try {
            Optional<Product> productOptional = productRepository.findById(productId);
            if (!productOptional.isPresent()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "Product not found with id: " + productId,
                        null
                );
            }
            
            Product product = productOptional.get();
            List<Bill> allBills;
            
            // Apply date filtering if provided
            if (startDate != null && endDate != null) {
                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
                allBills = billRepository.findByBillDateBetween(startDateTime, endDateTime);
            } else {
                allBills = billRepository.findAll();
            }
            
            if (allBills.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No bills found for the specified period",
                        null
                );
            }
            
            // Extract all bill items for this product
            List<BillItem> productItems = allBills.stream()
                    .flatMap(bill -> bill.getItems().stream())
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .collect(Collectors.toList());
            
            if (productItems.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No sales found for product: " + product.getName(),
                        null
                );
            }
            
            ProductReportDTO report = new ProductReportDTO();
            
            // Calculate total quantity sold and revenue
            int totalQuantitySold = productItems.stream()
                    .mapToInt(BillItem::getQuantity)
                    .sum();
            
            BigDecimal totalRevenue = productItems.stream()
                    .map(BillItem::getLineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Add to top selling by quantity
            ProductReportDTO.ProductSalesByQuantity quantitySales = new ProductReportDTO.ProductSalesByQuantity();
            quantitySales.setProductId(product.getId());
            quantitySales.setProductName(product.getName());
            quantitySales.setTotalQuantitySold(totalQuantitySold);
            quantitySales.setPercentageOfTotalSales(new BigDecimal("100.00")); // 100% since it's the only product
            report.getTopSellingByQuantity().add(quantitySales);
            
            // Add to top selling by revenue
            ProductReportDTO.ProductSalesByRevenue revenueSales = new ProductReportDTO.ProductSalesByRevenue();
            revenueSales.setProductId(product.getId());
            revenueSales.setProductName(product.getName());
            revenueSales.setTotalRevenue(totalRevenue);
            revenueSales.setPercentageOfTotalRevenue(new BigDecimal("100.00")); // 100% since it's the only product
            report.getTopSellingByRevenue().add(revenueSales);
            
            // Category sales
            ProductReportDTO.CategorySales categorySales = new ProductReportDTO.CategorySales();
            categorySales.setCategory(product.getCategory() != null ? product.getCategory() : "Uncategorized");
            categorySales.setTotalSales(totalRevenue);
            categorySales.setItemsSold(totalQuantitySold);
            report.getCategorySales().add(categorySales);
            
            // Monthly sales trend
            Map<String, ProductReportDTO.MonthlySales> monthlySalesMap = new HashMap<>();
            
            for (BillItem item : productItems) {
                Bill bill = item.getBill();
                String yearMonth = bill.getBillDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                
                ProductReportDTO.MonthlySales monthlySales = monthlySalesMap.computeIfAbsent(
                        yearMonth, k -> new ProductReportDTO.MonthlySales()
                );
                
                monthlySales.setTotalSales(monthlySales.getTotalSales().add(item.getLineTotal()));
                monthlySales.setItemsSold(monthlySales.getItemsSold() + item.getQuantity());
            }
            
            report.setMonthlySalesTrend(monthlySalesMap);
            
            // Customer preferences
            Set<Customer> uniqueCustomers = new HashSet<>();
            Map<Customer, Integer> purchaseCountByCustomer = new HashMap<>();
            
            for (BillItem item : productItems) {
                Bill bill = item.getBill();
                Customer customer = bill.getCustomer();
                if (customer != null) {
                    uniqueCustomers.add(customer);
                    purchaseCountByCustomer.merge(customer, 1, Integer::sum);
                }
            }
            
            ProductReportDTO.CustomerPreference preference = new ProductReportDTO.CustomerPreference();
            preference.setProductId(product.getId());
            preference.setProductName(product.getName());
            preference.setUniqueCustomers(uniqueCustomers.size());
            
            // Calculate repeat purchase rate
            if (!uniqueCustomers.isEmpty()) {
                long repeatCustomers = purchaseCountByCustomer.values().stream()
                        .filter(count -> count > 1)
                        .count();
                
                BigDecimal repeatRate = new BigDecimal(repeatCustomers)
                        .divide(new BigDecimal(uniqueCustomers.size()), 2, RoundingMode.HALF_UP);
                
                preference.setRepeatPurchaseRate(repeatRate);
            }
            
            report.getCustomerPreferences().add(preference);
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Product report generated successfully for: " + product.getName(),
                    report
            );
            
        } catch (Exception e) {
            return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error generating product report: " + e.getMessage(),
                    null
            );
        }
    }
    
    /**
     * Generate a comprehensive business overview report
     * 
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @return ApiResponse containing the business report
     */
    public ApiResponse generateBusinessReport(LocalDate startDate, LocalDate endDate) {
        try {
            List<Bill> allBills;
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            // Apply date filtering if provided
            if (startDate != null && endDate != null) {
                startDateTime = startDate.atStartOfDay();
                endDateTime = endDate.atTime(23, 59, 59);
                allBills = billRepository.findByBillDateBetween(startDateTime, endDateTime);
            } else {
                allBills = billRepository.findAll();
            }
            
            if (allBills.isEmpty()) {
                return new ApiResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "No bills found for the specified period",
                        null
                );
            }
            
            BusinessReportDTO report = new BusinessReportDTO();
            
            // Calculate basic metrics
            report.setTotalBills(allBills.size());
            
            BigDecimal totalRevenue = allBills.stream()
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            report.setTotalRevenue(totalRevenue);
            
            if (!allBills.isEmpty()) {
                report.setAverageBillValue(
                        totalRevenue.divide(new BigDecimal(allBills.size()), 2, RoundingMode.HALF_UP)
                );
            }
            
            // Count unique customers
            Set<Customer> uniqueCustomers = allBills.stream()
                    .map(Bill::getCustomer)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            report.setCustomerCount(uniqueCustomers.size());
            
            // Count new customers this month
            if (startDateTime != null && endDateTime != null) {
                // For date range reports, count customers who made their first purchase in this period
                YearMonth currentMonth = YearMonth.from(LocalDate.now());
                
                long newCustomersCount = uniqueCustomers.stream()
                        .filter(customer -> {
                            // Find customer's first bill
                            Optional<Bill> firstBill = allBills.stream()
                                    .filter(bill -> customer.equals(bill.getCustomer()))
                                    .min(Comparator.comparing(Bill::getBillDate));
                            
                            return firstBill.isPresent() && 
                                   YearMonth.from(firstBill.get().getBillDate()).equals(currentMonth);
                        })
                        .count();
                
                report.setNewCustomersThisMonth((int) newCustomersCount);
            }
            
            // Category performance
            Map<String, BigDecimal> currentRevenue = new HashMap<>();
            Map<String, BigDecimal> previousRevenue = new HashMap<>();
            
            // Extract all bill items
            List<BillItem> allItems = allBills.stream()
                    .flatMap(bill -> bill.getItems().stream())
                    .collect(Collectors.toList());
            
            // Calculate current period revenue by category
            for (BillItem item : allItems) {
                Product product = item.getProduct();
                String category = product.getCategory();
                
                if (category == null || category.isEmpty()) {
                    category = "Uncategorized";
                }
                
                currentRevenue.merge(category, item.getLineTotal(), BigDecimal::add);
            }
            
            // If date range is provided, calculate previous period for growth comparison
            if (startDateTime != null && endDateTime != null) {
                // Calculate previous period of same length
                long daysBetween = startDate.until(endDate).getDays() + 1;
                LocalDateTime previousStartDateTime = startDateTime.minusDays(daysBetween);
                LocalDateTime previousEndDateTime = startDateTime.minusSeconds(1);
                
                List<Bill> previousBills = billRepository.findByBillDateBetween(previousStartDateTime, previousEndDateTime);
                
                // Calculate previous period revenue by category
                for (Bill bill : previousBills) {
                    for (BillItem item : bill.getItems()) {
                        Product product = item.getProduct();
                        String category = product.getCategory();
                        
                        if (category == null || category.isEmpty()) {
                            category = "Uncategorized";
                        }
                        
                        previousRevenue.merge(category, item.getLineTotal(), BigDecimal::add);
                    }
                }
            }
            
            // Calculate category performance with growth
            List<BusinessReportDTO.CategoryPerformance> categoryPerformances = new ArrayList<>();
            
            for (Map.Entry<String, BigDecimal> entry : currentRevenue.entrySet()) {
                String category = entry.getKey();
                BigDecimal revenue = entry.getValue();
                
                BusinessReportDTO.CategoryPerformance performance = new BusinessReportDTO.CategoryPerformance();
                performance.setCategory(category);
                performance.setRevenue(revenue);
                
                // Calculate growth if previous data exists
                if (previousRevenue.containsKey(category) && previousRevenue.get(category).compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal previousRev = previousRevenue.get(category);
                    BigDecimal growth = revenue.subtract(previousRev)
                            .multiply(new BigDecimal("100"))
                            .divide(previousRev, 2, RoundingMode.HALF_UP);
                    performance.setGrowth(growth);
                }
                
                categoryPerformances.add(performance);
            }
            
            // Sort by revenue and take top 5
            categoryPerformances.sort((c1, c2) -> c2.getRevenue().compareTo(c1.getRevenue()));
            report.setTopPerformingCategories(
                    categoryPerformances.subList(0, Math.min(5, categoryPerformances.size()))
            );
            
            // Payment method breakdown
            for (Bill bill : allBills) {
                String paymentMethod = bill.getPaymentMethod();
                
                if (paymentMethod == null || paymentMethod.isEmpty()) {
                    paymentMethod = "Unknown";
                }
                
                BusinessReportDTO.PaymentMethodStats stats = report.getPaymentMethodBreakdown().computeIfAbsent(
                        paymentMethod, k -> new BusinessReportDTO.PaymentMethodStats()
                );
                
                stats.setCount(stats.getCount() + 1);
                stats.setAmount(stats.getAmount().add(bill.getTotalAmount()));
            }
            
            // Sales by day of week
            Map<String, BigDecimal> salesByDayOfWeek = new HashMap<>();
            
            for (Bill bill : allBills) {
                String dayOfWeek = bill.getBillDate().getDayOfWeek().toString();
                salesByDayOfWeek.merge(dayOfWeek, bill.getTotalAmount(), BigDecimal::add);
            }
            
            report.setSalesByDayOfWeek(salesByDayOfWeek);
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Business report generated successfully",
                    report
            );
            
        } catch (Exception e) {
            return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error generating business report: " + e.getMessage(),
                    null
            );
        }
    }
}