package com.fashionstore.service;

import com.fashionstore.model.Order;
import com.fashionstore.model.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfInvoiceService {

    public ByteArrayInputStream generateInvoice(Order order) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Invoice Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Paragraph title = new Paragraph("FASHION STORE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Subtitle
            Font invoiceWordFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Paragraph subtitle = new Paragraph("INVOICE RECEIPT", invoiceWordFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(15);
            document.add(subtitle);

            // Order Metadata
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            document.add(new Paragraph("Order Number: " + order.getId(), boldFont));
            document.add(new Paragraph("Tracking Number: " + order.getTrackingNumber(), regularFont));
            document.add(new Paragraph("Order Date: " + order.getOrderDate().format(formatter), regularFont));
            document.add(new Paragraph("Payment Method: " + (order.getOrderItems().isEmpty() ? "N/A" : "CREDIT_CARD/OTHER"), regularFont)); // default
            
            if (order.getCouponCode() != null) {
                document.add(new Paragraph("Coupon Applied: " + order.getCouponCode(), regularFont));
            }
            
            document.add(new Paragraph("Payment Status: " + order.getPaymentStatus(), regularFont));
            document.add(new Paragraph("Order Status: " + order.getStatus(), regularFont));
            document.add(Chunk.NEWLINE);

            // Customer Details
            document.add(new Paragraph("Billed To:", boldFont));
            document.add(new Paragraph(order.getUser().getFirstName() + " " + order.getUser().getLastName(), regularFont));
            document.add(new Paragraph(order.getUser().getEmail(), regularFont));
            if (order.getShippingAddress() != null) {
                document.add(new Paragraph("Shipping Address:", boldFont));
                document.add(new Paragraph(
                        order.getShippingAddress().getStreet() + ", " + 
                        order.getShippingAddress().getCity() + ", " + 
                        order.getShippingAddress().getState() + " - " + 
                        order.getShippingAddress().getZipCode() + ", " + 
                        order.getShippingAddress().getCountry(), regularFont));
            }
            document.add(Chunk.NEWLINE);

            // Items Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{40, 20, 20, 20});

            // Table Header
            table.addCell(new PdfPCell(new Phrase("Product Name", boldFont)));
            table.addCell(new PdfPCell(new Phrase("Price", boldFont)));
            table.addCell(new PdfPCell(new Phrase("Quantity", boldFont)));
            table.addCell(new PdfPCell(new Phrase("Total", boldFont)));

            BigDecimal subtotal = BigDecimal.ZERO;

            for (OrderItem item : order.getOrderItems()) {
                String productName = item.getProduct() != null ? item.getProduct().getName() : "Unknown Product";
                if (item.getSize() != null && !item.getSize().isEmpty()) {
                    productName += " (" + item.getSize() + ")";
                }
                BigDecimal price = item.getPrice();
                int qty = item.getQuantity();
                BigDecimal total = price.multiply(new BigDecimal(qty));
                subtotal = subtotal.add(total);

                table.addCell(new PdfPCell(new Phrase(productName, regularFont)));
                table.addCell(new PdfPCell(new Phrase("$" + price.toString(), regularFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(qty), regularFont)));
                table.addCell(new PdfPCell(new Phrase("$" + total.toString(), regularFont)));
            }

            document.add(table);
            document.add(Chunk.NEWLINE);

            // Price Breakdown Summary
            document.add(new Paragraph("Subtotal: $" + subtotal.toString(), regularFont));
            if (order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                document.add(new Paragraph("Discount: -$" + order.getDiscountAmount().toString(), regularFont));
            }
            document.add(new Paragraph("Grand Total: $" + order.getTotalAmount().toString(), boldFont));

            // Thank you note
            document.add(Chunk.NEWLINE);
            Paragraph thankYou = new Paragraph("Thank you for shopping with Fashion Store!", italicFont());
            thankYou.setAlignment(Element.ALIGN_CENTER);
            document.add(thankYou);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private Font italicFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
    }
}
