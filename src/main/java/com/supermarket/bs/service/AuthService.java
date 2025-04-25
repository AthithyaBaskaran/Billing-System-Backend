package com.supermarket.bs.service;

import com.supermarket.bs.config.JwtTokenUtil;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AuthService(CustomerRepository customerRepository, 
                      @Lazy PasswordEncoder passwordEncoder, 
                      JwtTokenUtil jwtTokenUtil) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return new User(
                customer.getEmail(),
                customer.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
    }

    public Customer registerCustomer(Customer customer) {
        // Check if email already exists
        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        // Encode password
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        
        // Initialize loyalty points
        if (customer.getLoyaltyPoints() == null) {
            customer.setLoyaltyPoints(0);
        }
        
        // Save customer
        return customerRepository.save(customer);
    }

    public String authenticateCustomer(String email, String password) {
        // Find customer by email
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(email);
        
        if (optionalCustomer.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        Customer customer = optionalCustomer.get();
        
        // Check password
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Generate JWT token
        return jwtTokenUtil.generateToken(customer.getEmail());
    }
    
    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}