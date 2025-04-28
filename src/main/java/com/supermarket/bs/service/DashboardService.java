package com.supermarket.bs.service;

import com.supermarket.bs.dto.ApiResponse;
import com.supermarket.bs.dto.SuccessResponse;
import com.supermarket.bs.model.ResetToken;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.repository.BillRepository;
import com.supermarket.bs.repository.CustomerRepository;
import com.supermarket.bs.repository.ProductRepository;
import com.supermarket.bs.repository.ResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class DashboardService {
    
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final BillRepository billRepository;

    private final ResetTokenRepository resetTokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.reset-password-url}")
    private String resetPasswordUrl;
    
    @Autowired
    public DashboardService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            BillRepository billRepository,

            ResetTokenRepository resetTokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.billRepository = billRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }
    
    public Map<String, Object> getCountsSummary() {
        Map<String, Object> counts = new HashMap<>();
        
        long customerCount = customerRepository.count();
        long productCount = productRepository.count();
        long billCount = billRepository.count();
        long totalCount = customerCount + productCount + billCount;
        
        counts.put("customerCount", customerCount);
        counts.put("productCount", productCount);
        counts.put("billCount", billCount);
        counts.put("totalCount", totalCount);
        
        return counts;
    }
    public ResponseEntity<ApiResponse<String>> resetPasswordRequest(String email) {
        ApiResponse<String> response = new ApiResponse<>();

        if (email == null || email.isEmpty()) {
            response.setStatusCode(400);
            response.setStatusMessage("Email cannot be empty");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<Customer> userOptional = customerRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            response.setStatusCode(403);
            response.setStatusMessage("Email is not registered");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        Customer user = userOptional.get();
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);

        ResetToken resetToken = new ResetToken();
        resetToken.setToken(token);
        resetToken.setExpirationTime(expiryDate);
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setUser(user);

        resetTokenRepository.save(resetToken);


        sendResetPasswordEmail(user, token);

        response.setStatusCode(200);
        response.setStatusMessage("Reset email sent successfully");
        response.setData(email);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }



    private void sendResetPasswordEmail(Customer user, String token) {
        String resetLink = resetPasswordUrl + "?token=" + token;
        String subject = "Password Reset Request";
        String content = "<p>Hello Dear,</p>"
                + "<p>You have requested to reset your password.</p>"
                + "<p>Click the link below link to reset it:</p>"
                + "<p><a href=\"" + resetLink + "\">Reset Password</a></p>"
                + "<br><p>If you did not request this, please ignore this email.</p>";
        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("afreenaa685@gmail.com");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }


    public ResponseEntity<ApiResponse<String>> resetPassword(String token, String newPassword, String confirmPassword) {
        ApiResponse<String> response = new ApiResponse<>();

        if (!newPassword.equals(confirmPassword)) {
            response.setStatusCode(400);
            response.setStatusMessage("Passwords do not match");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (!isValidPassword(newPassword)) {
            response.setStatusCode(400);
            response.setStatusMessage("Password must be at least 6 characters long, contain one special character, one uppercase, one lowercase, and one digit");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Optional<ResetToken> tokenOpt = resetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            response.setStatusCode(403);
            response.setStatusMessage("Invalid token");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        ResetToken resetToken = tokenOpt.get();
        if (resetToken.isExpired()) {
            response.setStatusCode(403);
            response.setStatusMessage("Token has expired");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        Customer user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(user);
        resetTokenRepository.delete(resetToken);

        response.setStatusCode(200);
        response.setStatusMessage("Password reset successfully");
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }
    private boolean isValidPassword(String password) {
        Pattern pattern = Pattern.compile("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{6,}$");
        return pattern.matcher(password).matches();
    }
}