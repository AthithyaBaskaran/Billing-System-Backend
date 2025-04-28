package com.supermarket.bs.dto;

import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    
    private CustomerInfo customerInfo;
    private List<BillInfo> bills = new ArrayList<>();
    private BigDecimal totalAmountSpent = BigDecimal.ZERO;
    private Integer totalLoyaltyPoints;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private Integer loyaltyPoints;
        
        public static CustomerInfo fromCustomer(Customer customer) {
            if (customer == null) {
                return null;
            }
            
            CustomerInfo info = new CustomerInfo();
            info.setId(customer.getId());
            info.setName(customer.getFirstName() + " " + customer.getLastName());
            info.setEmail(customer.getEmail());
            info.setPhone(customer.getPhone());
            info.setAddress(customer.getAddress());
            info.setLoyaltyPoints(customer.getLoyaltyPoints());
            return info;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillInfo {
        private Long id;
        private String billNumber;
        private LocalDateTime billDate;
        private BigDecimal subtotal;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private String paymentStatus;
        private List<ProductInfo> products = new ArrayList<>();
        
        public static BillInfo fromBill(Bill bill) {
            BillInfo info = new BillInfo();
            info.setId(bill.getId());
            info.setBillNumber(bill.getBillNumber());
            info.setBillDate(bill.getBillDate());
            info.setSubtotal(bill.getSubtotal());
            info.setTaxAmount(bill.getTaxAmount());
            info.setDiscountAmount(bill.getDiscountAmount());
            info.setTotalAmount(bill.getTotalAmount());
            info.setPaymentMethod(bill.getPaymentMethod());
            info.setPaymentStatus(bill.getPaymentStatus());
            
            // Add product information
            for (BillItem item : bill.getItems()) {
                ProductInfo productInfo = new ProductInfo();
                productInfo.setId(item.getProduct().getId());
                productInfo.setName(item.getProduct().getName());
                productInfo.setDescription(item.getProduct().getDescription());
                productInfo.setCategory(item.getProduct().getCategory());
                productInfo.setQuantity(item.getQuantity());
                productInfo.setUnitPrice(item.getUnitPrice());
                productInfo.setDiscountAmount(item.getDiscountAmount());
                productInfo.setLineTotal(item.getLineTotal());
                
                info.getProducts().add(productInfo);
            }
            
            return info;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String description;
        private String category;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountAmount;
        private BigDecimal lineTotal;
    }
    
    public static InvoiceDTO fromCustomerAndBills(Customer customer, List<Bill> bills) {
        InvoiceDTO invoice = new InvoiceDTO();
        invoice.setCustomerInfo(CustomerInfo.fromCustomer(customer));
        
        BigDecimal totalSpent = BigDecimal.ZERO;
        
        for (Bill bill : bills) {
            BillInfo billInfo = BillInfo.fromBill(bill);
            invoice.getBills().add(billInfo);
            totalSpent = totalSpent.add(bill.getTotalAmount());
        }
        
        invoice.setTotalAmountSpent(totalSpent);
        invoice.setTotalLoyaltyPoints(customer.getLoyaltyPoints());
        
        return invoice;
    }
}