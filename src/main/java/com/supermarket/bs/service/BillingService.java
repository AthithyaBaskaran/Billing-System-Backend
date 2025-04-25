package com.supermarket.bs.service;

import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
    
    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }
    
    public Optional<Bill> getBillByNumber(String billNumber) {
        return billRepository.findByBillNumber(billNumber);
    }
    
    public List<Bill> getBillsByCustomer(Customer customer) {
        return billRepository.findByCustomer(customer);
    }
    
    public List<Bill> getBillsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return billRepository.findByBillDateBetween(startDate, endDate);
    }
    
    public List<Bill> getBillsByPaymentMethod(String paymentMethod) {
        return billRepository.findByPaymentMethod(paymentMethod);
    }
    
    public List<Bill> getBillsByPaymentStatus(String paymentStatus) {
        return billRepository.findByPaymentStatus(paymentStatus);
    }
    
    @Transactional
    public Bill createBill(Customer customer, List<BillItem> items, String paymentMethod) {
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
        
        return billRepository.save(bill);
    }
    
    private String generateBillNumber() {
        // Generate a unique bill number with date prefix
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return "BILL-" + datePrefix + "-" + uniqueId;
    }
    
    public Bill updateBillPaymentStatus(Long billId, String paymentStatus) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + billId));
        
        bill.setPaymentStatus(paymentStatus);
        return billRepository.save(bill);
    }
}