package com.supermarket.bs.service;

import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.CustomerRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final BillRepository billRepository;
    
    @Autowired
    public DashboardService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            BillRepository billRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.billRepository = billRepository;
    }
    
    public Map<String, Object> getCountsSummary() {
        Map<String, Object> counts = new HashMap<>();
        
        long customerCount = customerRepository.count();
        long productCount = productRepository.count();
        long billCount = billRepository.count();
        long totalCount = customerCount + productCount + billCount;
        
        counts.put("customerCount", customerCount);
        counts.put("productCount", productCount);
        counts.put("billCount", billCount);
        counts.put("totalCount", totalCount);
        
        return counts;
    }
}