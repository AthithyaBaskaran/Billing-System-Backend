package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.model.Product;
import com.supermarket.bs.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    private final ProductService productService;
    
    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        
        List<Map<String, Object>> productList = products.stream()
                .map(this::convertProductToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Products fetched successfully",
                productList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(product -> {
                    Map<String, Object> productMap = convertProductToMap(product);
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Product fetched successfully",
                            productMap
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Product not found",
                                null
                        )));
    }
    
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse> getProductByBarcode(@PathVariable String barcode) {
        return productService.getProductByBarcode(barcode)
                .map(product -> {
                    Map<String, Object> productMap = convertProductToMap(product);
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Product fetched successfully",
                            productMap
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Product not found",
                                null
                        )));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchProducts(@RequestParam String name) {
        List<Product> products = productService.searchProductsByName(name);
        
        List<Map<String, Object>> productList = products.stream()
                .map(this::convertProductToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Products fetched successfully",
                productList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        
        List<Map<String, Object>> productList = products.stream()
                .map(this::convertProductToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Products in category '" + category + "' fetched successfully",
                productList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse> getLowStockProducts(@RequestParam(defaultValue = "10") Integer threshold) {
        List<Product> products = productService.getLowStockProducts(threshold);
        
        List<Map<String, Object>> productList = products.stream()
                .map(this::convertProductToMap)
                .collect(Collectors.toList());
        
        ApiResponse response = new ApiResponse(
                HttpStatus.OK.value(),
                "Low stock products (below " + threshold + ") fetched successfully",
                productList
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse> createProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        Map<String, Object> productMap = convertProductToMap(savedProduct);
        
        ApiResponse response = new ApiResponse(
                HttpStatus.CREATED.value(),
                "Product created successfully",
                productMap
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return productService.getProductById(id)
                .map(existingProduct -> {
                    product.setId(id);
                    Product updatedProduct = productService.saveProduct(product);
                    Map<String, Object> productMap = convertProductToMap(updatedProduct);
                    
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Product updated successfully",
                            productMap
                    );
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Product not found",
                                null
                        )));
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse> updateProductStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            Product updatedProduct = productService.updateProductStock(id, quantity);
            Map<String, Object> productMap = convertProductToMap(updatedProduct);
            
            ApiResponse response = new ApiResponse(
                    HttpStatus.OK.value(),
                    "Product stock updated successfully",
                    productMap
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            HttpStatus.NOT_FOUND.value(),
                            "Product not found",
                            null
                    ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(product -> {
                    productService.deleteProduct(id);
                    
                    ApiResponse response = new ApiResponse(
                            HttpStatus.OK.value(),
                            "Product deleted successfully",
                            null
                    );
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                HttpStatus.NOT_FOUND.value(),
                                "Product not found",
                                null
                        )));
    }
    
    // Helper method to convert Product to Map
    private Map<String, Object> convertProductToMap(Product product) {
        Map<String, Object> productMap = new HashMap<>();
        productMap.put("id", product.getId());
        productMap.put("name", product.getName());
        productMap.put("description", product.getDescription());
        productMap.put("barcode", product.getBarcode());
        productMap.put("category", product.getCategory());
        productMap.put("price", product.getPrice());
        productMap.put("stockQuantity", product.getStockQuantity());
        // Removed manufacturer field as it doesn't exist in the Product class
        return productMap;
    }
}