package com.fashionstore.controller;

import com.fashionstore.model.Coupon;
import com.fashionstore.repository.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @GetMapping("/{code}")
    public ResponseEntity<Coupon> validateCoupon(@PathVariable String code) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("This coupon has expired");
        }

        return ResponseEntity.ok(coupon);
    }
}
