package com.supermarket.bs.config;

import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.CustomerRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {
    
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    
    @Autowired
    public DataLoader(ProductRepository productRepository, CustomerRepository customerRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }
    
    @Override
    public void run(String... args) {
        // Load sample products
        loadProducts();
        
        // Load sample customers
        loadCustomers();
    }
    
    private void loadProducts() {
        System.out.println("Product data will be added dynamically from the front end");
    }
    
    private void loadCustomers() {
        System.out.println("Customer data will be added dynamically from the front end");
    }
}