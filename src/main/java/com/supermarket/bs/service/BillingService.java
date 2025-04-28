package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BillingService {
    
    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final CustomerService customerService;
    
    @Autowired
    public BillingService(BillRepository billRepository, ProductRepository productRepository, CustomerService customerService) {
        this.billRepository = billRepository;
        this.productRepository = productRepository;
        this.customerService = customerService;
    }
    
    public ApiResponse getAllBills() {
        List<Bill> bills = billRepository.findAll();
        return new ApiResponse(
                HttpStatus.OK.value(),
                "Bills fetched successfully",
                bills
        );
    }
    
    public ApiResponse getBillById(Long id) {
        Optional<Bill> billOptional = billRepository.findById(id);
        if (billOptional.isPresent()) {
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Bill fetched successfully",
                    billOptional.get()
            );
        } else {
            return new ApiResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Bill not found",
                    null
            );
        }
    }
    
    public ApiResponse getBillByNumber(String billNumber) {
        Optional<Bill> billOptional = billRepository.findByBillNumber(billNumber);
        if (billOptional.isPresent()) {
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Bill fetched successfully",
                    billOptional.get()
            );
        } else {
            return new ApiResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Bill not found",
                    null
            );
        }
    }
    
    public ApiResponse getBillsByCustomer(Customer customer) {
        List<Bill> bills = billRepository.findByCustomer(customer);
        return new ApiResponse(
                HttpStatus.OK.value(),
                "Bills for customer fetched successfully",
                bills
        );
    }
    
    public ApiResponse getBillsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Bill> bills = billRepository.findByBillDateBetween(startDate, endDate);
        return new ApiResponse(
                HttpStatus.OK.value(),
                "Bills within date range fetched successfully",
                bills
        );
    }
    
    public ApiResponse getBillsByPaymentMethod(String paymentMethod) {
        List<Bill> bills = billRepository.findByPaymentMethod(paymentMethod);
        return new ApiResponse(
                HttpStatus.OK.value(),
                "Bills with payment method '" + paymentMethod + "' fetched successfully",
                bills
        );
    }
    
    public ApiResponse getBillsByPaymentStatus(String paymentStatus) {
        List<Bill> bills = billRepository.findByPaymentStatus(paymentStatus);
        return new ApiResponse(
                HttpStatus.OK.value(),
                "Bills with payment status '" + paymentStatus + "' fetched successfully",
                bills
        );
    }
    
    @Transactional
    public ApiResponse createBill(Customer customer, List<BillItem> items, String paymentMethod) {
        try {
            Bill bill = new Bill();
            bill.setBillNumber(generateBillNumber());
            bill.setBillDate(LocalDateTime.now());
            bill.setCustomer(customer);
            bill.setPaymentMethod(paymentMethod);
            bill.setPaymentStatus("PAID"); // Default status
            
            // Add items to bill
            for (BillItem item : items) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProduct().getId()));
                
                // Check if enough stock is available
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Not enough stock for product: " + product.getName());
                }
                
                // Update product stock
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);
                
                // Set unit price from product
                item.setUnitPrice(product.getPrice());
                
                // Add item to bill
                bill.addItem(item);
            }
            
            // Apply loyalty discount if applicable
            if (customer != null && customer.getLoyaltyPoints() >= 100) {
                // 5% discount for loyal customers
                BigDecimal discountAmount = bill.getSubtotal().multiply(new BigDecimal("0.05"));
                bill.setDiscountAmount(discountAmount);
                
                // Recalculate total
                bill.setTotalAmount(bill.getSubtotal().add(bill.getTaxAmount()).subtract(bill.getDiscountAmount()));
                
                // Add loyalty points (1 point per $10 spent)
                int pointsEarned = bill.getTotalAmount().divide(new BigDecimal("10"), 0, BigDecimal.ROUND_DOWN).intValue();
                customerService.updateCustomerLoyaltyPoints(customer.getId(), pointsEarned);
            }
            
            Bill savedBill = billRepository.save(bill);
            
            return new ApiResponse(
                    HttpStatus.CREATED.value(),
                    "Bill created successfully",
                    savedBill
            );
        } catch (RuntimeException e) {
            return new ApiResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    e.getMessage(),
                    null
            );
        }
    }
    
    private String generateBillNumber() {
        // Generate a unique bill number with date prefix
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return "BILL-" + datePrefix + "-" + uniqueId;
    }
    
    public ApiResponse updateBillPaymentStatus(Long billId, String paymentStatus) {
        try {
            Bill bill = billRepository.findById(billId)
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
            
            bill.setPaymentStatus(paymentStatus);
            Bill updatedBill = billRepository.save(bill);
            
            return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Bill payment status updated successfully",
                    updatedBill
            );
        } catch (RuntimeException e) {
            return new ApiResponse(
                    HttpStatus.NOT_FOUND.value(),
                    e.getMessage(),
                    null
            );
        }
    }
}