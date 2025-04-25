package com.supermarket.bs.controller;

import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.service.BillingService;
import com.supermarket.bs.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillingController {
    
    private final BillingService billingService;
    private final CustomerService customerService;
    
    @Autowired
    public BillingController(BillingService billingService, CustomerService customerService) {
        this.billingService = billingService;
        this.customerService = customerService;
    }
    
    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billingService.getAllBills());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        return billingService.getBillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{billNumber}")
    public ResponseEntity<Bill> getBillByNumber(@PathVariable String billNumber) {
        return billingService.getBillByNumber(billNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Bill>> getBillsByCustomer(@PathVariable Long customerId) {
        return customerService.getCustomerById(customerId)
                .map(customer -> ResponseEntity.ok(billingService.getBillsByCustomer(customer)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<Bill>> getBillsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        return ResponseEntity.ok(billingService.getBillsByDateRange(startDateTime, endDateTime));
    }
    
    @GetMapping("/payment-method/{paymentMethod}")
    public ResponseEntity<List<Bill>> getBillsByPaymentMethod(@PathVariable String paymentMethod) {
        return ResponseEntity.ok(billingService.getBillsByPaymentMethod(paymentMethod));
    }
    
    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<Bill>> getBillsByPaymentStatus(@PathVariable String paymentStatus) {
        return ResponseEntity.ok(billingService.getBillsByPaymentStatus(paymentStatus));
    }
    
    @PostMapping
    public ResponseEntity<?> createBill(
            @RequestParam(required = false) Long customerId,
            @Valid @RequestBody List<BillItem> items,
            @RequestParam String paymentMethod) {
        
        try {
            Customer customer = null;
            if (customerId != null) {
                customer = customerService.getCustomerById(customerId)
                        .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
            }
            
            Bill createdBill = billingService.createBill(customer, items, paymentMethod);
            return new ResponseEntity<>(createdBill, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<Bill> updateBillPaymentStatus(
            @PathVariable Long id,
            @RequestParam String paymentStatus) {
        try {
            Bill updatedBill = billingService.updateBillPaymentStatus(id, paymentStatus);
            return ResponseEntity.ok(updatedBill);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}