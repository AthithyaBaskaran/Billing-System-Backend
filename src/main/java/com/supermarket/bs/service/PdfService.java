package com.supermarket.bs.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.supermarket.bs.model.Bill;
import com.supermarket.bs.model.BillItem;
import com.supermarket.bs.model.Customer;
import com.supermarket.bs.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Optional;

@Service
public class PdfService {

    private final BillRepository billRepository;

    @Autowired
    public PdfService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public byte[] generateBillPdf(Long billId) throws Exception {
        Optional<Bill> billOptional = billRepository.findByIdWithDetails(billId);
        
        if (!billOptional.isPresent()) {
            throw new Exception("Bill not found with id: " + billId);
        }
        
        Bill bill = billOptional.get();
        
        // Create a new document
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        
        // Open the document
        document.open();
        
        // Add metadata
        document.addTitle("Bill #" + bill.getBillNumber());
        document.addCreator("Supermarket Billing System");
        
        // Add header
        addHeader(document, bill);
        
        // Add customer information
        addCustomerInfo(document, bill.getCustomer());
        
        // Add bill details
        addBillDetails(document, bill);
        
        // Add items table
        addItemsTable(document, bill);
        
        // Add totals
        addTotals(document, bill);
        
        // Add footer
        addFooter(document);
        
        // Close the document
        document.close();
        
        return baos.toByteArray();
    }
    
    private void addHeader(Document document, Bill bill) throws DocumentException {
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        
        Paragraph title = new Paragraph("SUPERMARKET BILLING SYSTEM", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        Paragraph subtitle = new Paragraph("INVOICE", titleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        
        document.add(Chunk.NEWLINE);
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        Paragraph billInfo = new Paragraph();
        billInfo.add(new Chunk("Bill Number: " + bill.getBillNumber() + "\n", normalFont));
        billInfo.add(new Chunk("Date: " + dateFormat.format(java.sql.Timestamp.valueOf(bill.getBillDate())) + "\n", normalFont));
        billInfo.add(new Chunk("Payment Method: " + bill.getPaymentMethod() + "\n", normalFont));
        billInfo.add(new Chunk("Payment Status: " + bill.getPaymentStatus() + "\n", normalFont));
        document.add(billInfo);
        
        document.add(Chunk.NEWLINE);
    }
    
    private void addCustomerInfo(Document document, Customer customer) throws DocumentException {
        if (customer == null) {
            document.add(new Paragraph("Customer: Walk-in Customer"));
            document.add(Chunk.NEWLINE);
            return;
        }
        
        Font subheadingFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        
        Paragraph customerTitle = new Paragraph("Customer Information", subheadingFont);
        document.add(customerTitle);
        
        Paragraph customerInfo = new Paragraph();
        customerInfo.add(new Chunk("Name: " + customer.getFirstName()+" "+customer.getLastName() + "\n", normalFont));
        customerInfo.add(new Chunk("Email: " + customer.getEmail() + "\n", normalFont));
        customerInfo.add(new Chunk("Phone: " + customer.getPhone() + "\n", normalFont));
        customerInfo.add(new Chunk("Address: " + customer.getAddress() + "\n", normalFont));
        document.add(customerInfo);
        
        document.add(Chunk.NEWLINE);
    }
    
    private void addBillDetails(Document document, Bill bill) throws DocumentException {
        Font subheadingFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        
        Paragraph billTitle = new Paragraph("Bill Details", subheadingFont);
        document.add(billTitle);
        
        document.add(Chunk.NEWLINE);
    }
    
    private void addItemsTable(Document document, Bill bill) throws DocumentException {
        PdfPTable table = new PdfPTable(5); // 5 columns
        table.setWidthPercentage(100);
        
        // Set column widths
        float[] columnWidths = {1f, 4f, 1f, 2f, 2f};
        table.setWidths(columnWidths);
        
        // Add table headers
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        PdfPCell cell;
        
        cell = new PdfPCell(new Phrase("No.", headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
        
        cell = new PdfPCell(new Phrase("Product", headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
        
        cell = new PdfPCell(new Phrase("Qty", headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
        
        cell = new PdfPCell(new Phrase("Price", headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
        
        cell = new PdfPCell(new Phrase("Total", headerFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
        
        // Add items
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        int itemNumber = 1;
        
        for (BillItem item : bill.getItems()) {
            // Item number
            cell = new PdfPCell(new Phrase(String.valueOf(itemNumber++), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
            
            // Product name
            cell = new PdfPCell(new Phrase(item.getProduct().getName(), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            table.addCell(cell);
            
            // Quantity
            cell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
            
            // Price
            cell = new PdfPCell(new Phrase(String.format("%.2f", item.getUnitPrice()), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cell);
            
            // Total
            cell = new PdfPCell(new Phrase(String.format("%.2f", item.getLineTotal()), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cell);
        }
        
        document.add(table);
        document.add(Chunk.NEWLINE);
    }
    
    private void addTotals(Document document, Bill bill) throws DocumentException {
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(50);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        // Set column widths
        float[] columnWidths = {3f, 2f};
        totalsTable.setWidths(columnWidths);
        
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        PdfPCell cell;
        
        // Subtotal
        cell = new PdfPCell(new Phrase("Subtotal:", boldFont));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        cell = new PdfPCell(new Phrase(String.format("%.2f", bill.getSubtotal()), normalFont));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        // Tax
        cell = new PdfPCell(new Phrase("Tax:", boldFont));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        cell = new PdfPCell(new Phrase(String.format("%.2f", bill.getTaxAmount()), normalFont));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        // Discount
        if (bill.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            cell = new PdfPCell(new Phrase("Discount:", boldFont));
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            cell.setBorder(Rectangle.NO_BORDER);
            totalsTable.addCell(cell);
            
            cell = new PdfPCell(new Phrase(String.format("%.2f", bill.getDiscountAmount()), normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cell.setBorder(Rectangle.NO_BORDER);
            totalsTable.addCell(cell);
        }
        
        // Total
        cell = new PdfPCell(new Phrase("Total:", boldFont));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        cell = new PdfPCell(new Phrase(String.format("%.2f", bill.getTotalAmount()), boldFont));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(cell);
        
        document.add(totalsTable);
        document.add(Chunk.NEWLINE);
    }
    
    private void addFooter(Document document) throws DocumentException {
        Font italicFont = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC);
        
        Paragraph footer = new Paragraph();
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.add(new Chunk("Thank you for shopping with us!", italicFont));
        document.add(footer);
        
        Paragraph contact = new Paragraph();
        contact.setAlignment(Element.ALIGN_CENTER);
        contact.add(new Chunk("For any queries, please contact us at support@supermarket.com", italicFont));
        document.add(contact);
    }
}