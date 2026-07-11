package com.fashionstore.repository;

import com.fashionstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByResetToken(String token);
    long countByRole(com.fashionstore.model.Role role);
    java.util.List<User> findByRole(com.fashionstore.model.Role role);
    java.util.List<User> findByAgencyId(Long agencyId);
}
