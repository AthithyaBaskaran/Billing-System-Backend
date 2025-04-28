package com.supermarket.bs.controller;

import com.supermarket.bs.dto.*;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            // Create customer from signup request
            Customer customer = new Customer();
            customer.setFirstName(signupRequest.getFirstName());
            customer.setLastName(signupRequest.getLastName());
            customer.setEmail(signupRequest.getEmail());
            customer.setPhone(signupRequest.getPhone());
            customer.setAddress(signupRequest.getAddress());
            customer.setPassword(signupRequest.getPassword());
            customer.setLoyaltyPoints(0);
            
            // Register customer
            Customer registeredCustomer = authService.registerCustomer(customer);
            
            // Create data map for customer details
            Map<String, Object> customerData = new HashMap<>();
            customerData.put("id", registeredCustomer.getId());
            customerData.put("name", registeredCustomer.getFirstName() + " " + registeredCustomer.getLastName());
            customerData.put("email", registeredCustomer.getEmail());
            customerData.put("phone", registeredCustomer.getPhone());
            customerData.put("address", registeredCustomer.getAddress());
            customerData.put("loyaltyPoints", registeredCustomer.getLoyaltyPoints());
            
            // Create API response
            ApiResponse response = new ApiResponse(
                    HttpStatus.OK.value(),
                    "User details fetched",
                    customerData
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ApiResponse errorResponse = new ApiResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    e.getMessage(),
                    null
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateCustomer(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate customer and get token
            String token = authService.authenticateCustomer(loginRequest.getEmail(), loginRequest.getPassword());
            
            // Get customer details
            Customer customer = authService.getCustomerByEmail(loginRequest.getEmail());
            
            // Create data map for customer details with token included
            Map<String, Object> customerData = new HashMap<>();
            customerData.put("userId", customer.getId());
            customerData.put("name", customer.getFirstName() + " " + customer.getLastName());
            customerData.put("email", customer.getEmail());
            customerData.put("token", token);
            
            // Create API response
            ApiResponse response = new ApiResponse(
                    HttpStatus.OK.value(),
                    "Login successful",
                    customerData
            );
            
            // Return response with token in the body
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse errorResponse = new ApiResponse(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Invalid email or password",
                    null
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}