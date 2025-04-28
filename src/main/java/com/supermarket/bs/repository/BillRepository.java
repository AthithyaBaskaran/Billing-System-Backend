package com.supermarket.bs.repository;

import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    
    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product WHERE b.billNumber = :billNumber")
    Optional<Bill> findByBillNumber(@Param("billNumber") String billNumber);
    
    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product WHERE b.id = :id")
    Optional<Bill> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product WHERE b.customer = :customer")
    List<Bill> findByCustomer(@Param("customer") Customer customer);
    
    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.items i LEFT JOIN FETCH i.product WHERE b.customer = :customer AND b.billDate BETWEEN :startDate AND :endDate")
    List<Bill> findByCustomerAndBillDateBetween(@Param("customer") Customer customer, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    List<Bill> findByBillDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Bill> findByPaymentMethod(String paymentMethod);
    
    List<Bill> findByPaymentStatus(String paymentStatus);
}