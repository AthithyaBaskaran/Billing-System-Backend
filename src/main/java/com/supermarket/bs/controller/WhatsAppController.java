package com.supermarket.bs.controller;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.WhatsAppMessageDTO;
import com.supermarket.bs.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    @Autowired
    public WhatsAppController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    /**
     * Send a WhatsApp message
     * 
     * @param messageDTO The message details
     * @return ResponseEntity with the result
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendMessage(@RequestBody WhatsAppMessageDTO messageDTO) {
        ApiResponse response = whatsAppService.sendMessage(messageDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /**
     * Send a bill notification via WhatsApp
     * 
     * @param billId The ID of the bill
     * @return ResponseEntity with the result
     */
    @PostMapping("/send-bill/{billId}")
    public ResponseEntity<ApiResponse> sendBillNotification(@PathVariable Long billId) {
        ApiResponse response = whatsAppService.sendBillNotification(billId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}