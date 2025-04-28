package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.BusinessReportDTO;
import com.supermarket.bs.dto.CustomerReportDTO;
import com.supermarket.bs.dto.ProductReportDTO;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.CustomerRepository;
import com.supermarket.bs.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReportService reportService;

    private List<Customer> testCustomers;
    private List<Product> testProducts;
    private List<Bill> testBills;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Create test customers
        testCustomers = new ArrayList<>();
        Customer customer1 = new Customer();
        customer1.setId(1L);
        customer1.setFirstName("John");
        customer1.setLastName("Doe");
        customer1.setEmail("john.doe@example.com");
        customer1.setLoyaltyPoints(100);

        Customer customer2 = new Customer();
        customer2.setId(2L);
        customer2.setFirstName("Jane");
        customer2.setLastName("Smith");
        customer2.setEmail("jane.smith@example.com");
        customer2.setLoyaltyPoints(50);

        testCustomers.add(customer1);
        testCustomers.add(customer2);

        // Create test products
        testProducts = new ArrayList<>();
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Product 1");
        product1.setDescription("Description 1");
        product1.setPrice(new BigDecimal("10.00"));
        product1.setCategory("Category 1");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Product 2");
        product2.setDescription("Description 2");
        product2.setPrice(new BigDecimal("20.00"));
        product2.setCategory("Category 2");

        testProducts.add(product1);
        testProducts.add(product2);

        // Create test bills
        testBills = new ArrayList<>();
        
        // Bill 1 for Customer 1
        Bill bill1 = new Bill();
        bill1.setId(1L);
        bill1.setBillNumber("BILL-20230101-12345678");
        bill1.setBillDate(LocalDateTime.now().minusDays(10));
        bill1.setCustomer(customer1);
        bill1.setPaymentMethod("CASH");
        bill1.setPaymentStatus("PAID");
        bill1.setSubtotal(new BigDecimal("30.00"));
        bill1.setTaxAmount(new BigDecimal("3.00"));
        bill1.setTotalAmount(new BigDecimal("33.00"));

        BillItem item1 = new BillItem();
        item1.setId(1L);
        item1.setBill(bill1);
        item1.setProduct(product1);
        item1.setQuantity(1);
        item1.setUnitPrice(new BigDecimal("10.00"));
        item1.setDiscountAmount(BigDecimal.ZERO);

        BillItem item2 = new BillItem();
        item2.setId(2L);
        item2.setBill(bill1);
        item2.setProduct(product2);
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("20.00"));
        item2.setDiscountAmount(BigDecimal.ZERO);

        List<BillItem> items1 = new ArrayList<>();
        items1.add(item1);
        items1.add(item2);
        bill1.setItems(items1);

        // Bill 2 for Customer 2
        Bill bill2 = new Bill();
        bill2.setId(2L);
        bill2.setBillNumber("BILL-20230102-87654321");
        bill2.setBillDate(LocalDateTime.now().minusDays(5));
        bill2.setCustomer(customer2);
        bill2.setPaymentMethod("CREDIT_CARD");
        bill2.setPaymentStatus("PAID");
        bill2.setSubtotal(new BigDecimal("20.00"));
        bill2.setTaxAmount(new BigDecimal("2.00"));
        bill2.setTotalAmount(new BigDecimal("22.00"));

        BillItem item3 = new BillItem();
        item3.setId(3L);
        item3.setBill(bill2);
        item3.setProduct(product2);
        item3.setQuantity(1);
        item3.setUnitPrice(new BigDecimal("20.00"));
        item3.setDiscountAmount(BigDecimal.ZERO);

        List<BillItem> items2 = new ArrayList<>();
        items2.add(item3);
        bill2.setItems(items2);

        testBills.add(bill1);
        testBills.add(bill2);
    }

    @Test
    void generateCustomerReport_Success() {
        // Arrange
        when(customerRepository.findAll()).thenReturn(testCustomers);
        when(billRepository.findAll()).thenReturn(testBills);

        // Act
        ApiResponse<S> response = reportService.generateCustomerReport(null, null);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.getData() instanceof CustomerReportDTO);
        
        CustomerReportDTO report = (CustomerReportDTO) response.getData();
        assertEquals(2, report.getCustomerAnalytics().size());
    }

    @Test
    void generateProductReport_Success() {
        // Arrange
        when(billRepository.findAll()).thenReturn(testBills);

        // Act
        ApiResponse<S> response = reportService.generateProductReport(null, null);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.getData() instanceof ProductReportDTO);
        
        ProductReportDTO report = (ProductReportDTO) response.getData();
        assertEquals(2, report.getTopSellingByQuantity().size());
    }

    @Test
    void generateBusinessReport_Success() {
        // Arrange
        when(billRepository.findAll()).thenReturn(testBills);

        // Act
        ApiResponse<S> response = reportService.generateBusinessReport(null, null);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.getData() instanceof BusinessReportDTO);
        
        BusinessReportDTO report = (BusinessReportDTO) response.getData();
        assertEquals(2, report.getTotalBills());
        assertEquals(new BigDecimal("55.00"), report.getTotalRevenue());
    }

    @Test
    void generateCustomerReport_WithDateRange() {
        // Arrange
        LocalDate startDate = LocalDate.now().minusDays(15);
        LocalDate endDate = LocalDate.now();
        
        when(customerRepository.findAll()).thenReturn(testCustomers);
        when(billRepository.findByBillDateBetween(any(), any())).thenReturn(testBills);

        // Act
        ApiResponse<S> response = reportService.generateCustomerReport(startDate, endDate);

        // Assert
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        verify(billRepository).findByBillDateBetween(any(), any());
    }

    @Test
    void generateCustomerReport_NoBills() {
        // Arrange
        when(customerRepository.findAll()).thenReturn(testCustomers);
        when(billRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        ApiResponse<S> response = reportService.generateCustomerReport(null, null);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
        assertNull(response.getData());
    }
}