package com.fashionstore.dto;

import java.math.BigDecimal;
import java.util.List;

public class SalesSummary {
    private BigDecimal totalSales;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private List<SalesDataPoint> salesByDate;
    private List<CategoryDataPoint> salesByCategory;

    public SalesSummary() {}

    public SalesSummary(BigDecimal totalSales, long totalOrders, long totalProducts, long totalUsers, 
                        List<SalesDataPoint> salesByDate, List<CategoryDataPoint> salesByCategory) {
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.totalProducts = totalProducts;
        this.totalUsers = totalUsers;
        this.salesByDate = salesByDate;
        this.salesByCategory = salesByCategory;
    }

    // Getters and Setters
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public List<SalesDataPoint> getSalesByDate() { return salesByDate; }
    public void setSalesByDate(List<SalesDataPoint> salesByDate) { this.salesByDate = salesByDate; }

    public List<CategoryDataPoint> getSalesByCategory() { return salesByCategory; }
    public void setSalesByCategory(List<CategoryDataPoint> salesByCategory) { this.salesByCategory = salesByCategory; }

    // Static nested records for serialization
    public record SalesDataPoint(String date, BigDecimal sales, long orders) {}
    public record CategoryDataPoint(String category, BigDecimal sales) {}
}
