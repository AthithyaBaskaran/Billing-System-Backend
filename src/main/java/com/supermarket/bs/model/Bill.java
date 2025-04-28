package com.supermarket.bs.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String billNumber;
    
    @NotNull(message = "Bill date is required")
    private LocalDateTime billDate = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();
    
    private BigDecimal subtotal = BigDecimal.ZERO;
    
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    private String paymentMethod;
    
    private String paymentStatus;
    
    // Method to add an item to the bill
    public void addItem(BillItem item) {
        items.add(item);
        item.setBill(this);
        recalculateAmounts();
    }
    
    // Method to remove an item from the bill
    public void removeItem(BillItem item) {
        items.remove(item);
        item.setBill(null);
        recalculateAmounts();
    }
    
    // Method to recalculate bill amounts
    private void recalculateAmounts() {
        this.subtotal = items.stream()
                .map(BillItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Assuming tax rate of 10%
        this.taxAmount = this.subtotal.multiply(new BigDecimal("0.10"));
        
        this.totalAmount = this.subtotal.add(this.taxAmount).subtract(this.discountAmount);
    }
}