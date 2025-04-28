package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.service.BillingService;
import com.supermarket.bs.service.CustomerService;
import com.supermarket.bs.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
public class BillingController {
    
    private final BillingService billingService;
    private final CustomerService customerService;
    private final PdfService pdfService;
    
    @Autowired
    public BillingController(BillingService billingService, CustomerService customerService, PdfService pdfService) {
        this.billingService = billingService;
        this.customerService = customerService;
        this.pdfService = pdfService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse> getAllBills() {
        ApiResponse response = billingService.getAllBills();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getBillById(@PathVariable Long id) {
        ApiResponse response = billingService.getBillById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/number/{billNumber}")
    public ResponseEntity<ApiResponse> getBillByNumber(@PathVariable String billNumber) {
        ApiResponse response = billingService.getBillByNumber(billNumber);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse> getBillsByCustomer(@PathVariable Long customerId) {
        Optional<Customer> customerOptional = customerService.getCustomerById(customerId);
        
        if (!customerOptional.isPresent()) {
            ApiResponse errorResponse = new ApiResponse(
                HttpStatus.NOT_FOUND.value(),
                "Customer not found with id: " + customerId,
                null
            );
            return ResponseEntity.status(errorResponse.getStatusCode()).body(errorResponse);
        }
        
        Customer customer = customerOptional.get();
        ApiResponse response = billingService.getBillsByCustomer(customer);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse> getBillsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        ApiResponse response = billingService.getBillsByDateRange(startDateTime, endDateTime);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/payment-method/{paymentMethod}")
    public ResponseEntity<ApiResponse> getBillsByPaymentMethod(@PathVariable String paymentMethod) {
        ApiResponse response = billingService.getBillsByPaymentMethod(paymentMethod);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<ApiResponse> getBillsByPaymentStatus(@PathVariable String paymentStatus) {
        ApiResponse response = billingService.getBillsByPaymentStatus(paymentStatus);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse> createBill(
            @RequestParam(required = false) Long customerId,
            @Valid @RequestBody List<BillItem> items,
            @RequestParam String paymentMethod) {
        
        Customer customer = null;
        if (customerId != null) {
            Optional<Customer> customerOptional = customerService.getCustomerById(customerId);
            if (!customerOptional.isPresent()) {
                ApiResponse errorResponse = new ApiResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Customer not found with id: " + customerId,
                    null
                );
                return ResponseEntity.status(errorResponse.getStatusCode()).body(errorResponse);
            }
            customer = customerOptional.get();
        }
        
        ApiResponse response = billingService.createBill(customer, items, paymentMethod);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<ApiResponse> updateBillPaymentStatus(
            @PathVariable Long id,
            @RequestParam String paymentStatus) {
        ApiResponse response = billingService.updateBillPaymentStatus(id, paymentStatus);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Generate a detailed invoice for a specific customer
     * 
     * @param customerId The ID of the customer
     * @return ResponseEntity containing the invoice data
     */
    @GetMapping("/invoice/customer/{customerId}")
    public ResponseEntity<ApiResponse> generateCustomerInvoice(@PathVariable Long customerId) {
        ApiResponse response = billingService.generateCustomerInvoice(customerId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    
    /**
     * Download a bill as PDF
     * 
     * @param id The ID of the bill to download
     * @return ResponseEntity containing the PDF file
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadBillAsPdf(@PathVariable Long id) {
        try {
            // Get bill details first to check if it exists
            ApiResponse billResponse = billingService.getBillById(id);
            if (billResponse.getStatusCode() != HttpStatus.OK.value()) {
                return ResponseEntity.status(billResponse.getStatusCode()).body(billResponse);
            }
            
            // Generate PDF
            byte[] pdfBytes = pdfService.generateBillPdf(id);
            
            // Set up headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bill-" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            ApiResponse errorResponse = new ApiResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error generating PDF: " + e.getMessage(),
                null
            );
            return ResponseEntity.status(errorResponse.getStatusCode()).body(errorResponse);
        }
    }
}