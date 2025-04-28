package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.InvoiceDTO;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BillingServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private BillingService billingService;

    private Customer testCustomer;
    private List<Bill> testBills;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Create test customer
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setEmail("john.doe@example.com");
        testCustomer.setPhone("1234567890");
        testCustomer.setAddress("123 Test St");
        testCustomer.setLoyaltyPoints(100);

        // Create test product
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("10.00"));
        testProduct.setStockQuantity(100);
        testProduct.setCategory("Test Category");

        // Create test bill items
        BillItem testBillItem = new BillItem();
        testBillItem.setId(1L);
        testBillItem.setProduct(testProduct);
        testBillItem.setQuantity(2);
        testBillItem.setUnitPrice(new BigDecimal("10.00"));
        testBillItem.setDiscountAmount(BigDecimal.ZERO);

        // Create test bills
        Bill testBill = new Bill();
        testBill.setId(1L);
        testBill.setBillNumber("BILL-20230101-12345678");
        testBill.setBillDate(LocalDateTime.now());
        testBill.setCustomer(testCustomer);
        testBill.setPaymentMethod("CASH");
        testBill.setPaymentStatus("PAID");
        testBill.setSubtotal(new BigDecimal("20.00"));
        testBill.setTaxAmount(new BigDecimal("2.00"));
        testBill.setDiscountAmount(BigDecimal.ZERO);
        testBill.setTotalAmount(new BigDecimal("22.00"));
        
        List<BillItem> items = new ArrayList<>();
        testBillItem.setBill(testBill);
        items.add(testBillItem);
        testBill.setItems(items);

        testBills = new ArrayList<>();
        testBills.add(testBill);
    }

    @Test
    void generateCustomerInvoice_Success() {
        // Arrange
        when(customerService.getCustomerById(1L)).thenReturn(Optional.of(testCustomer));
        when(billRepository.findByCustomer(testCustomer)).thenReturn(testBills);

        // Act
        ApiResponse<S> response = billingService.generateCustomerInvoice(1L);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.getData() instanceof InvoiceDTO);
        
        InvoiceDTO invoice = (InvoiceDTO) response.getData();
        assertEquals(testCustomer.getId(), invoice.getCustomerInfo().getId());
        assertEquals(testCustomer.getFirstName() + " " + testCustomer.getLastName(), 
                invoice.getCustomerInfo().getName());
        assertEquals(1, invoice.getBills().size());
        assertEquals(testBills.get(0).getBillNumber(), invoice.getBills().get(0).getBillNumber());
        assertEquals(1, invoice.getBills().get(0).getProducts().size());
        assertEquals(testProduct.getName(), invoice.getBills().get(0).getProducts().get(0).getName());
    }

    @Test
    void generateCustomerInvoice_CustomerNotFound() {
        // Arrange
        when(customerService.getCustomerById(999L)).thenReturn(Optional.empty());

        // Act
        ApiResponse<S> response = billingService.generateCustomerInvoice(999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
        assertNull(response.getData());
        assertTrue(response.getMessage().contains("Customer not found"));
    }

    @Test
    void generateCustomerInvoice_NoBills() {
        // Arrange
        when(customerService.getCustomerById(1L)).thenReturn(Optional.of(testCustomer));
        when(billRepository.findByCustomer(testCustomer)).thenReturn(new ArrayList<>());

        // Act
        ApiResponse<S> response = billingService.generateCustomerInvoice(1L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
        assertNull(response.getData());
        assertTrue(response.getMessage().contains("No bills found"));
    }
}