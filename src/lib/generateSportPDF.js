'use client';

export async function generateSportDetailsPDF(sport, approvedMembers, pendingRequests, assignedCoaches) {
    // Dynamically import jsPDF (client-side only)
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to add text and manage page breaks
    const addTextWithBreak = (text, x, y, size = 10, maxWidth = contentWidth) => {
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 5);
    };

    // Helper function to check and add page if needed
    const checkPageBreak = (yPos, minSpace = 30) => {
        if (yPos > pageHeight - minSpace) {
            doc.addPage();
            return 20;
        }
        return yPos;
    };

    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`${sport.name.toUpperCase()} - SPORT DETAILS`, margin, yPosition);
    yPosition += 20;

    // Sport Info Box
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.rect(margin, yPosition - 5, contentWidth, 25);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Status: ${sport.status}`, margin + 5, yPosition + 2);
    doc.text(`Created: ${new Date(sport.createdAt).toLocaleDateString()}`, margin + 5, yPosition + 8);
    doc.text(`Last Updated: ${new Date(sport.updatedAt).toLocaleDateString()}`, margin + 5, yPosition + 14);
    yPosition += 35;

    // Sport Description
    if (sport.description) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("Description", margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(sport.description, contentWidth - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 10;
    }

    yPosition = checkPageBreak(yPosition, 50);

    // Assigned Coaches Section
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text("ASSIGNED COACHES", margin, yPosition);
    yPosition += 12;

    if (assignedCoaches.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        
        // Header
        doc.setFillColor(79, 70, 229);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.rect(margin, yPosition - 5, contentWidth, 6, 'F');
        doc.text("#", margin + 3, yPosition);
        doc.text("Coach Name", margin + 12, yPosition);
        doc.text("Email Address", margin + 90, yPosition);
        
        yPosition += 8;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(40, 40, 40);
        
        // Data rows
        assignedCoaches.forEach((coach, idx) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            
            if (idx % 2 === 0) {
                doc.setFillColor(245, 247, 252);
                doc.rect(margin, yPosition - 4, contentWidth, 7, 'F');
            }
            
            // Index
            doc.setTextColor(100, 100, 100);
            doc.text(String(idx + 1), margin + 3, yPosition);
            
            // Coach name (bold for emphasis)
            doc.setTextColor(40, 40, 40);
            doc.setFont(undefined, 'bold');
            const coachNameDisplay = coach.name || 'N/A';
            doc.text(coachNameDisplay.substring(0, 40), margin + 12, yPosition);
            doc.setFont(undefined, 'normal');
            
            // Email
            doc.setTextColor(80, 120, 160);
            doc.text((coach.email || 'N/A').substring(0, 35), margin + 90, yPosition);
            
            yPosition += 8;
        });
        
        yPosition += 5;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("No coaches assigned to this sport", margin, yPosition);
        yPosition += 8;
    }

    yPosition = checkPageBreak(yPosition, 50);

    // Approved Members Section
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`APPROVED MEMBERS (${approvedMembers.length})`, margin, yPosition);
    yPosition += 12;

    if (approvedMembers.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        // Header
        doc.setFillColor(34, 197, 94);
        doc.setTextColor(255, 255, 255);
        doc.rect(margin, yPosition - 5, contentWidth, 6, 'F');
        doc.text("#", margin + 2, yPosition);
        doc.text("Name", margin + 10, yPosition);
        doc.text("University ID", margin + 50, yPosition);
        doc.text("Email", margin + 85, yPosition);
        
        yPosition += 8;
        doc.setTextColor(80, 80, 80);
        
        // Data rows
        approvedMembers.forEach((member, idx) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            
            if (idx % 2 === 0) {
                doc.setFillColor(245, 250, 245);
                doc.rect(margin, yPosition - 4, contentWidth, 6, 'F');
            }
            
            doc.text(String(idx + 1), margin + 2, yPosition);
            doc.text(member.name.substring(0, 25), margin + 10, yPosition);
            doc.text(member.universityId, margin + 50, yPosition);
            doc.text(member.universityEmail.substring(0, 30), margin + 85, yPosition);
            yPosition += 6;
        });
        
        yPosition += 5;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("No approved members yet", margin, yPosition);
        yPosition += 8;
    }

    yPosition = checkPageBreak(yPosition, 50);

    // Pending Requests Section
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`PENDING REQUESTS (${pendingRequests.length})`, margin, yPosition);
    yPosition += 12;

    if (pendingRequests.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        // Header
        doc.setFillColor(217, 119, 6);
        doc.setTextColor(255, 255, 255);
        doc.rect(margin, yPosition - 5, contentWidth, 6, 'F');
        doc.text("#", margin + 2, yPosition);
        doc.text("Student Name", margin + 10, yPosition);
        doc.text("University ID", margin + 55, yPosition);
        doc.text("Email", margin + 90, yPosition);
        
        yPosition += 8;
        doc.setTextColor(80, 80, 80);
        
        // Data rows
        pendingRequests.forEach((req, idx) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            
            if (idx % 2 === 0) {
                doc.setFillColor(255, 248, 240);
                doc.rect(margin, yPosition - 4, contentWidth, 6, 'F');
            }
            
            doc.text(String(idx + 1), margin + 2, yPosition);
            doc.text((req.studentId?.name || 'Unknown').substring(0, 20), margin + 10, yPosition);
            doc.text(req.studentId?.universityId || 'N/A', margin + 55, yPosition);
            doc.text((req.studentId?.universityEmail || 'N/A').substring(0, 25), margin + 90, yPosition);
            yPosition += 6;
        });
    } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("No pending requests", margin, yPosition);
    }

    // Footer - Add page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
        );
        doc.text(
            `Generated: ${new Date().toLocaleString()}`,
            margin,
            pageHeight - 8
        );
    }

    return doc;
}
