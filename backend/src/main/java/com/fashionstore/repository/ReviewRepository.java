package com.fashionstore.repository;

import com.fashionstore.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByUserId(Long userId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
