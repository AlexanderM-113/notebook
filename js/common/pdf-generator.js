// PDF Generator - Helper functions for PDF generation
class PdfGenerator {
    constructor() {
        this.jsPDF = window.jspdf.jsPDF;
    }

    // Generate complete notebook PDF
    async generateNotebookPDF(notebook, user, entries, pages) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create PDF document
                const doc = new this.jsPDF({
                    orientation: 'portrait',
                    unit: 'in',
                    format: 'letter'
                });

                const pageWidth = 8.5;
                const pageHeight = 11;
                const margin = 0.75;
                const contentWidth = pageWidth - (margin * 2);
                let currentY = margin;

                // Helper function to add new page
                const addNewPage = () => {
                    doc.addPage();
                    currentY = margin;
                };

                // Helper function to check if we need a new page
                const checkNewPage = (neededHeight) => {
                    if (currentY + neededHeight > pageHeight - margin) {
                        addNewPage();
                        return true;
                    }
                    return false;
                };

                // Add cover page
                this.addCoverPage(doc, notebook, user, pageWidth, pageHeight, margin);
                addNewPage();

                // Add table of contents
                this.addTableOfContents(doc, pages, pageWidth, margin, currentY);
                addNewPage();

                // Add all pages with user data
                for (const page of pages) {
                    const entry = entries.find(e => e.page_id === page.$id);
                    
                    if (page.page_type === 'template') {
                        await this.addTemplatePage(doc, page, entry, contentWidth, margin, currentY, checkNewPage);
                    } else {
                        await this.addContentPage(doc, page, entry, contentWidth, margin, currentY, checkNewPage);
                    }
                    
                    addNewPage();
                }

                // Generate PDF blob
                const pdfBlob = doc.output('blob');
                resolve(pdfBlob);

            } catch (error) {
                console.error('Error generating PDF:', error);
                reject(error);
            }
        });
    }

    // Add cover page
    addCoverPage(doc, notebook, user, pageWidth, pageHeight, margin) {
        // Background color
        if (notebook.cover_background_color) {
            doc.setFillColor(notebook.cover_background_color);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }

        // Title
        doc.setFontSize(32);
        doc.setTextColor(notebook.cover_text_color || '#000000');
        doc.text(notebook.title || 'Notebook', pageWidth / 2, 2, { align: 'center' });

        // Subtitle
        if (notebook.cover_subtitle) {
            doc.setFontSize(18);
            doc.text(notebook.cover_subtitle, pageWidth / 2, 2.5, { align: 'center' });
        }

        // User info
        doc.setFontSize(14);
        doc.text(`Submitted by: ${user.first_name}`, pageWidth / 2, pageHeight - 2, { align: 'center' });
        
        const date = new Date().toLocaleDateString();
        doc.text(`Date: ${date}`, pageWidth / 2, pageHeight - 1.5, { align: 'center' });

        // Logo if available
        if (notebook.cover_logo_id) {
            // You would need to fetch and add the logo image here
            // This is a placeholder for logo implementation
        }
    }

    // Add table of contents
    addTableOfContents(doc, pages, pageWidth, margin, startY) {
        doc.setFontSize(20);
        doc.setTextColor('#000000');
        doc.text('Table of Contents', margin, startY);

        let y = startY + 0.5;
        doc.setFontSize(12);

        pages.forEach((page, index) => {
            const pageTitle = page.title || `Page ${index + 1}`;
            const pageNumber = index + 3; // +2 for cover and TOC
            
            doc.text(`${pageTitle}`, margin, y);
            doc.text(`${pageNumber}`, pageWidth - margin, y, { align: 'right' });
            
            y += 0.3;
        });
    }

    // Add template page with user responses
    async addTemplatePage(doc, page, entry, contentWidth, margin, startY, checkNewPage) {
        let y = startY;

        // Page title
        doc.setFontSize(18);
        doc.setTextColor('#000000');
        doc.text(page.title || 'Template Page', margin, y);
        y += 0.5;

        // Page elements
        if (entry && entry.responses) {
            for (const response of entry.responses) {
                const label = response.question_text || 'Question';
                const value = response.response_value || '';

                // Check if we need a new page
                checkNewPage(0.5);

                // Question
                doc.setFontSize(12);
                doc.setTextColor('#333333');
                doc.text(label, margin, y);
                y += 0.25;

                // Answer
                doc.setFontSize(11);
                doc.setTextColor('#666666');
                const lines = doc.splitTextToSize(value, contentWidth);
                doc.text(lines, margin, y);
                y += (lines.length * 0.2) + 0.25;

                // Image if present
                if (response.image_file_id) {
                    checkNewPage(2);
                    // Add image placeholder
                    // In production, you would fetch and embed the actual image
                    doc.text('[Image]', margin, y);
                    y += 0.5;
                }
            }
        }

        // Signature
        if (entry && entry.signature_file_id) {
            checkNewPage(1.5);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            doc.text('Signature:', margin, y);
            y += 0.5;
            
            // Add signature image placeholder
            // In production, you would fetch and embed the actual signature
            doc.text('[Signature Image]', margin, y);
        }
    }

    // Add content page with signature
    async addContentPage(doc, page, entry, contentWidth, margin, startY, checkNewPage) {
        let y = startY;

        // Page title
        doc.setFontSize(18);
        doc.setTextColor('#000000');
        doc.text(page.title || 'Content Page', margin, y);
        y += 0.5;

        // Page content
        if (page.content) {
            doc.setFontSize(12);
            doc.setTextColor('#333333');
            const lines = doc.splitTextToSize(page.content, contentWidth);
            
            lines.forEach(line => {
                checkNewPage(0.25);
                doc.text(line, margin, y);
                y += 0.25;
            });
        }

        // Signature
        if (entry && entry.signature_file_id) {
            checkNewPage(1.5);
            doc.setFontSize(12);
            doc.setTextColor('#000000');
            doc.text('Acknowledged by:', margin, y);
            y += 0.5;
            
            // Add signature image placeholder
            // In production, you would fetch and embed the actual signature
            doc.text('[Signature Image]', margin, y);
        }
    }

    // Download PDF
    downloadPDF(pdfBlob, filename) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Generate PDF filename
    generateFilename(notebookName, userName, date) {
        const sanitizedNotebook = notebookName.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedUser = userName.replace(/[^a-zA-Z0-9]/g, '_');
        const formattedDate = date.toISOString().split('T')[0];
        
        return `${sanitizedNotebook}_${sanitizedUser}_${formattedDate}.pdf`;
    }
}

// Create global PDF generator instance
const pdfGenerator = new PdfGenerator();