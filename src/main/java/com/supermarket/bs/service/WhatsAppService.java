package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.WhatsAppMessageDTO;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.repository.BillRepository;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;

@Service
public class WhatsAppService {

    @Value("${whatsapp.green-api.instance-id}")
    private String instanceId;

    @Value("${whatsapp.green-api.api-token}")
    private String apiToken;

    @Value("${whatsapp.green-api.base-url}")
    private String baseUrl;

    @Value("${whatsapp.green-api.enabled:false}")
    private boolean enabled;

    private final BillRepository billRepository;
    private final PdfService pdfService;

    @Autowired
    public WhatsAppService(BillRepository billRepository, PdfService pdfService) {
        this.billRepository = billRepository;
        this.pdfService = pdfService;
    }

    /**
     * Send a WhatsApp message
     * 
     * @param messageDTO The message details
     * @return ApiResponse with the result
     */
    public ApiResponse sendMessage(WhatsAppMessageDTO messageDTO) {
        if (!enabled) {
            return new ApiResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "WhatsApp integration is disabled",
                null
            );
        }

        try {
            // Validate phone number
            String phoneNumber = normalizePhoneNumber(messageDTO.getPhoneNumber());
            if (phoneNumber == null) {
                return new ApiResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Invalid phone number format. Please include country code (e.g., 919876543210)",
                    null
                );
            }

            // Send text message
            boolean messageSent = sendTextMessage(phoneNumber, messageDTO.getMessage());
            
            // If bill ID is provided and PDF is requested, send the bill as PDF
            if (messageDTO.isSendPdf() && messageDTO.getBillId() != null) {
                sendBillAsPdf(phoneNumber, messageDTO.getBillId());
            }

            if (messageSent) {
                return new ApiResponse(
                    HttpStatus.OK.value(),
                    "WhatsApp message sent successfully",
                    null
                );
            } else {
                return new ApiResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to send WhatsApp message",
                    null
                );
            }
        } catch (Exception e) {
            return new ApiResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error sending WhatsApp message: " + e.getMessage(),
                null
            );
        }
    }

    /**
     * Send a bill notification via WhatsApp
     * 
     * @param billId The ID of the bill
     * @return ApiResponse with the result
     */
    public ApiResponse sendBillNotification(Long billId) {
        if (!enabled) {
            return new ApiResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "WhatsApp integration is disabled",
                null
            );
        }

        try {
            Optional<Bill> billOptional = billRepository.findByIdWithDetails(billId);
            if (!billOptional.isPresent()) {
                return new ApiResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Bill not found with id: " + billId,
                    null
                );
            }

            Bill bill = billOptional.get();
            Customer customer = bill.getCustomer();
            
            // Check if customer exists and has a phone number
            if (customer == null || customer.getPhone() == null || customer.getPhone().isEmpty()) {
                return new ApiResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Customer does not have a valid phone number",
                    null
                );
            }

            // Normalize phone number
            String phoneNumber = normalizePhoneNumber(customer.getPhone());
            if (phoneNumber == null) {
                return new ApiResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Invalid phone number format. Please update customer with valid phone including country code",
                    null
                );
            }

            // Create bill notification message
            String message = createBillNotificationMessage(bill);
            
            // Send text message
            boolean messageSent = sendTextMessage(phoneNumber, message);
            
            // Send bill as PDF
            boolean pdfSent = sendBillAsPdf(phoneNumber, billId);

            if (messageSent && pdfSent) {
                return new ApiResponse(
                    HttpStatus.OK.value(),
                    "Bill notification sent successfully via WhatsApp",
                    null
                );
            } else {
                return new ApiResponse(
                    HttpStatus.PARTIAL_CONTENT.value(),
                    "Bill notification partially sent via WhatsApp",
                    null
                );
            }
        } catch (Exception e) {
            return new ApiResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error sending bill notification: " + e.getMessage(),
                null
            );
        }
    }

    /**
     * Create a formatted bill notification message
     * 
     * @param bill The bill to create a notification for
     * @return Formatted message string
     */
    private String createBillNotificationMessage(Bill bill) {
        StringBuilder message = new StringBuilder();
        
        message.append("*SUPERMARKET BILLING SYSTEM*\n\n");
        message.append("Dear ").append(bill.getCustomer().getFirstName()).append(",\n\n");
        message.append("Thank you for your purchase! Here's your bill summary:\n\n");
        message.append("*Bill Number:* ").append(bill.getBillNumber()).append("\n");
        message.append("*Date:* ").append(bill.getBillDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))).append("\n");
        message.append("*Payment Method:* ").append(bill.getPaymentMethod()).append("\n");
        message.append("*Payment Status:* ").append(bill.getPaymentStatus()).append("\n\n");
        
        message.append("*Items:*\n");
        for (BillItem item : bill.getItems()) {
            message.append("- ").append(item.getProduct().getName())
                  .append(" (").append(item.getQuantity()).append(" x ")
                  .append(String.format("%.2f", item.getUnitPrice())).append(") = ")
                  .append(String.format("%.2f", item.getLineTotal())).append("\n");
        }
        
        message.append("\n*Subtotal:* ").append(String.format("%.2f", bill.getSubtotal())).append("\n");
        message.append("*Tax:* ").append(String.format("%.2f", bill.getTaxAmount())).append("\n");
        
        if (bill.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            message.append("*Discount:* ").append(String.format("%.2f", bill.getDiscountAmount())).append("\n");
        }
        
        message.append("*Total Amount:* ").append(String.format("%.2f", bill.getTotalAmount())).append("\n\n");
        
        message.append("Thank you for shopping with us!\n");
        message.append("For any queries, please contact us at support@supermarket.com");
        
        return message.toString();
    }

    /**
     * Send a text message via WhatsApp
     * 
     * @param phoneNumber The recipient's phone number
     * @param message The message content
     * @return true if successful, false otherwise
     */
    private boolean sendTextMessage(String phoneNumber, String message) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Create the API endpoint URL
            String url = baseUrl + "/waInstance" + instanceId + "/sendMessage/" + apiToken;
            
            // Create the request
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Content-Type", "application/json");
            
            // Create the request body
            JSONObject requestBody = new JSONObject();
            requestBody.put("chatId", phoneNumber + "@c.us");
            requestBody.put("message", message);
            
            // Set the request entity
            StringEntity entity = new StringEntity(requestBody.toString(), ContentType.APPLICATION_JSON);
            httpPost.setEntity(entity);
            
            // Execute the request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getCode();
                return statusCode >= 200 && statusCode < 300;
            }
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Send a bill as PDF via WhatsApp
     * 
     * @param phoneNumber The recipient's phone number
     * @param billId The ID of the bill
     * @return true if successful, false otherwise
     */
    private boolean sendBillAsPdf(String phoneNumber, Long billId) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Generate PDF
            byte[] pdfBytes = pdfService.generateBillPdf(billId);
            
            // Get bill details for filename
            Optional<Bill> billOptional = billRepository.findById(billId);
            if (!billOptional.isPresent()) {
                return false;
            }
            
            Bill bill = billOptional.get();
            String fileName = "bill-" + bill.getBillNumber() + ".pdf";
            
            // Encode PDF to Base64
            String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
            
            // Create the API endpoint URL
            String url = baseUrl + "/waInstance" + instanceId + "/sendFileByBase64/" + apiToken;
            
            // Create the request
            HttpPost httpPost = new HttpPost(url);
            httpPost.setHeader("Content-Type", "application/json");
            
            // Create the request body
            JSONObject requestBody = new JSONObject();
            requestBody.put("chatId", phoneNumber + "@c.us");
            requestBody.put("fileName", fileName);
            requestBody.put("caption", "Your bill #" + bill.getBillNumber());
            requestBody.put("base64", "data:application/pdf;base64," + base64Pdf);
            
            // Set the request entity
            StringEntity entity = new StringEntity(requestBody.toString(), ContentType.APPLICATION_JSON);
            httpPost.setEntity(entity);
            
            // Execute the request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getCode();
                return statusCode >= 200 && statusCode < 300;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Normalize a phone number to the format required by Green-API
     * 
     * @param phoneNumber The phone number to normalize
     * @return Normalized phone number or null if invalid
     */
    private String normalizePhoneNumber(String phoneNumber) {
        // Remove all non-digit characters
        String digitsOnly = phoneNumber.replaceAll("\\D", "");
        
        // Check if the number starts with a plus sign and remove it
        if (phoneNumber.startsWith("+")) {
            digitsOnly = phoneNumber.substring(1).replaceAll("\\D", "");
        }
        
        // Ensure the number has a valid length (at least 10 digits)
        if (digitsOnly.length() < 10) {
            return null;
        }
        
        return digitsOnly;
    }
}