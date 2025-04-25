package com.supermarket.bs.repository;

import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    Optional<Bill> findByBillNumber(String billNumber);
    
    List<Bill> findByCustomer(Customer customer);
    
    List<Bill> findByBillDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Bill> findByPaymentMethod(String paymentMethod);
    
    List<Bill> findByPaymentStatus(String paymentStatus);
}