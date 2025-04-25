package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private final CustomerService customerService;
    
    @Autowired
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        
        List<Map<String, Object>> customerList = customers.stream()
                .map(this::convertCustomerToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                " All Customers fetched",
                customerList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(customer -> {
                    Map<String, Object> customerMap = convertCustomerToMap(customer);
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Customer fetched successfully",
                            customerMap
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Customer not found",
                                null
                        )));
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse> getCustomerByEmail(@PathVariable String email) {
        return customerService.getCustomerByEmail(email)
                .map(customer -> {
                    Map<String, Object> customerMap = convertCustomerToMap(customer);
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Customer fetched successfully",
                            customerMap
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Customer not found",
                                null
                        )));
    }
    
    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse> getCustomerByPhone(@PathVariable String phone) {
        return customerService.getCustomerByPhone(phone)
                .map(customer -> {
                    Map<String, Object> customerMap = convertCustomerToMap(customer);
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Customer fetched successfully",
                            customerMap
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Customer not found",
                                null
                        )));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchCustomers(@RequestParam String firstName) {
        List<Customer> customers = customerService.searchCustomersByFirstName(firstName);
        
        List<Map<String, Object>> customerList = customers.stream()
                .map(this::convertCustomerToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Customers fetched successfully",
                customerList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/loyalty")
    public ResponseEntity<ApiResponse> getCustomersWithLoyaltyPointsAbove(@RequestParam(defaultValue = "100") Integer points) {
        List<Customer> customers = customerService.getCustomersWithLoyaltyPointsAbove(points);
        
        List<Map<String, Object>> customerList = customers.stream()
                .map(this::convertCustomerToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Customers with loyalty points above " + points + " fetched successfully",
                customerList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse> createCustomer(@Valid @RequestBody Customer customer) {
        Customer savedCustomer = customerService.saveCustomer(customer);
        Map<String, Object> customerMap = convertCustomerToMap(savedCustomer);
        
        ApiResponse response = new ApiResponse(
                HttpStatus.CREATED.value(),
                "Customer created successfully",
                customerMap
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return customerService.getCustomerById(id)
                .map(existingCustomer -> {
                    customer.setId(id);
                    Customer updatedCustomer = customerService.saveCustomer(customer);
                    Map<String, Object> customerMap = convertCustomerToMap(updatedCustomer);
                    
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Customer updated successfully",
                            customerMap
                    );
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Customer not found",
                                null
                        )));
    }
    
    @PatchMapping("/{id}/loyalty-points")
    public ResponseEntity<ApiResponse> updateCustomerLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam Integer points) {
        try {
            Customer updatedCustomer = customerService.updateCustomerLoyaltyPoints(id, points);
            Map<String, Object> customerMap = convertCustomerToMap(updatedCustomer);
            
            ApiResponse response = new ApiResponse(
                    HttpStatus.OK.value(),
                    "Customer loyalty points updated successfully",
                    customerMap
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            HttpStatus.NOT_FOUND.value(),
                            "Customer not found",
                            null
                    ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCustomer(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(customer -> {
                    customerService.deleteCustomer(id);
                    
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Customer deleted successfully",
                            null
                    );
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Customer not found",
                                null
                        )));
    }
    
    // Helper method to convert Customer to Map
    private Map<String, Object> convertCustomerToMap(Customer customer) {
        Map<String, Object> customerMap = new HashMap<>();
        customerMap.put("id", customer.getId());
        customerMap.put("firstName", customer.getFirstName());
        customerMap.put("lastName", customer.getLastName());
        customerMap.put("email", customer.getEmail());
        customerMap.put("phone", customer.getPhone());
        customerMap.put("address", customer.getAddress());
        customerMap.put("loyaltyPoints", customer.getLoyaltyPoints());
        return customerMap;
    }
}