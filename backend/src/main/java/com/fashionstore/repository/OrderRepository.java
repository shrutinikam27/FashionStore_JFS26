package com.fashionstore.repository;

import com.fashionstore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findAllByOrderByOrderDateDesc();
    
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = 'PAID' OR o.paymentStatus = 'SUCCESS'")
    List<Order> findPaidOrders();
    
    List<Order> findByDeliveryPersonIdOrderByOrderDateDesc(Long deliveryPersonId);
    
    List<Order> findByAgencyIdOrderByOrderDateDesc(Long agencyId);
}
