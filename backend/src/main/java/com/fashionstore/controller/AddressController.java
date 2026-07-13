package com.fashionstore.controller;

import com.fashionstore.dto.AddressRequest;
import com.fashionstore.model.Address;
import com.fashionstore.model.User;
import com.fashionstore.repository.AddressRepository;
import com.fashionstore.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressController(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(addressRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(@Valid @RequestBody AddressRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        List<Address> existing = addressRepository.findByUserId(user.getId());
        
        Address address = new Address();
        address.setUser(user);
        address.setStreet(request.street());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        address.setCountry(request.country());
        
        // If this is the first address, force it to be default
        if (existing.isEmpty()) {
            address.setDefault(true);
        } else {
            address.setDefault(request.isDefault());
            // If setting this as default, unset previous default
            if (request.isDefault()) {
                for (Address addr : existing) {
                    if (addr.isDefault()) {
                        addr.setDefault(false);
                        addressRepository.save(addr);
                    }
                }
            }
        }

        return ResponseEntity.ok(addressRepository.save(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not authorized to delete this address");
        }

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        // If the deleted address was the default, assign a new default from remaining addresses
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }

        return ResponseEntity.noContent().build();
    }
}
