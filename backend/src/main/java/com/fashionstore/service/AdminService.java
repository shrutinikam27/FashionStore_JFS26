package com.fashionstore.service;

import com.fashionstore.dto.SalesSummary;
import com.fashionstore.model.Order;
import com.fashionstore.model.OrderItem;
import com.fashionstore.model.Role;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, ProductRepository productRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public SalesSummary getSalesAnalytics() {
        long totalUsers = userRepository.countByRole(Role.CUSTOMER);
        long totalProducts = productRepository.countByActiveTrue();
        
        List<Order> paidOrders = orderRepository.findPaidOrders();
        long totalOrders = paidOrders.size();

        BigDecimal totalSales = paidOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group sales and orders count by date
        Map<String, BigDecimal> salesDateMap = new TreeMap<>();
        Map<String, Long> ordersDateMap = new TreeMap<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Order order : paidOrders) {
            String dateStr = order.getOrderDate().format(dtf);
            salesDateMap.put(dateStr, salesDateMap.getOrDefault(dateStr, BigDecimal.ZERO).add(order.getTotalAmount()));
            ordersDateMap.put(dateStr, ordersDateMap.getOrDefault(dateStr, 0L) + 1L);
        }

        List<SalesSummary.SalesDataPoint> salesByDate = new ArrayList<>();
        for (String date : salesDateMap.keySet()) {
            salesByDate.add(new SalesSummary.SalesDataPoint(date, salesDateMap.get(date), ordersDateMap.get(date)));
        }

        // Group sales by category
        Map<String, BigDecimal> categorySalesMap = new HashMap<>();
        for (Order order : paidOrders) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                    String catName = item.getProduct().getCategory().getName();
                    BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                    categorySalesMap.put(catName, categorySalesMap.getOrDefault(catName, BigDecimal.ZERO).add(itemTotal));
                }
            }
        }

        List<SalesSummary.CategoryDataPoint> salesByCategory = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categorySalesMap.entrySet()) {
            salesByCategory.add(new SalesSummary.CategoryDataPoint(entry.getKey(), entry.getValue()));
        }

        return new SalesSummary(totalSales, totalOrders, totalProducts, totalUsers, salesByDate, salesByCategory);
    }
}
