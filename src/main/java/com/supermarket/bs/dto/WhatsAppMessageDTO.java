package com.supermarket.bs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppMessageDTO {
    private String phoneNumber; // Recipient phone number with country code (e.g., 919876543210)
    private String message;     // Message content
    private Long billId;        // Optional: Associated bill ID
    private boolean sendPdf;    // Whether to send PDF attachment
}