// Function to load and parse the JSON data
async function loadResumeData() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const resumeContainer = document.getElementById('resume-content');

    try {
        const version = Date.now();
        const response = await fetch(`resume-data.json?version=${version}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resumeData = await response.json();
        
        renderResume(resumeData);
        
        // Hide loading with fade out
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            resumeContainer.style.opacity = '1';
            resumeContainer.style.transition = 'opacity 0.8s ease';
        }, 600); // match transition duration
    } catch (error) {
        console.error('Error loading resume data:', error);
        document.getElementById('resume-name').textContent = 'Error loading resume';
        
        // Still hide loading even if error occurs
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            resumeContainer.style.opacity = '1';
        }, 600);
    }
}

// Function to render all resume data
function renderResume(data) {
    // Personal Information
    const fullName = data.personal.name;
    document.getElementById('resume-name').textContent = data.personal.name;
    document.getElementById('resume-title').textContent = data.personal.title;
    // Page title
    document.title = `${fullName} - Resume`;
    
    // Contact Info
    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <p><i class="fas fa-envelope"></i> ${data.personal.email}</p>
        <p><i class="fas fa-phone"></i> ${data.personal.phone}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</p>
    `;
    
    // Professional Summary
    document.getElementById('summary-text').textContent = data.summary;
    
    // Work Experience
    renderWorkExperience(data.workExperience);
    
    // Skills
    renderSkills(data.skills);
    
    // Languages
    renderLanguages(data.languages);
    
    // Education
    renderEducation(data.education);
    
    // Personal Details
    document.getElementById('personal-details').innerHTML = `
        <p><strong>Date of Birth:</strong> ${data.personal.dateOfBirth}</p>
        <p><strong>Location:</strong> ${data.personal.location}</p>
    `;
    
    // Footer
    document.getElementById('footer-text').textContent = data.footer.copyright;
    
    // Setup PDF download button after resume is rendered
    setTimeout(setupPDFDownload, 100);
}

// Function to render work experience
function renderWorkExperience(experience) {
    const container = document.getElementById('work-experience');
    container.innerHTML = '';
    
    experience.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'experience-item';
        jobElement.innerHTML = `
            <div class="job-header">
                <h3>${job.company}</h3>
                <span class="job-date">${job.startDate} - ${job.endDate}</span>
            </div>
            <p class="job-position">${job.position} | ${job.location}</p>
            <ul class="job-responsibilities">
                ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        `;
        container.appendChild(jobElement);
    });
}

// Function to render skills
function renderSkills(skills) {
    const container = document.getElementById('skills-section');
    container.innerHTML = `
        <div class="skill-category">
            <h4>Technical Skills</h4>
            <div class="skill-list">
                ${skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="skill-category">
            <h4>Professional Skills</h4>
            <div class="skill-list">
                ${skills.professional.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    `;
}

// Function to render languages
function renderLanguages(languages) {
    const container = document.getElementById('languages-list');
    container.innerHTML = languages.map(lang => `
        <div class="language-item">
            <span class="language-name">${lang.name}</span>
            <span class="language-level">${lang.level}</span>
        </div>
    `).join('');
}

// Function to render education
function renderEducation(education) {
    const container = document.getElementById('education-list');
    container.innerHTML = education.map(edu => `
        <div class="education-item">
            <h4>${edu.degree}</h4>
            <p class="education-detail">${edu.institution}</p>
            <p class="education-date">${edu.completionDate}</p>
        </div>
    `).join('');
}

// PDF Download Functionality with Selectable Text and Graphics
function setupPDFDownload() {
    const downloadBtn = document.getElementById('download-pdf-btn');
    
    if (!downloadBtn) {
        console.log('Download button not found, retrying in 1 second...');
        setTimeout(setupPDFDownload, 1000);
        return;
    }
    
    downloadBtn.addEventListener('click', async function() {
        console.log('PDF generation started...');
        
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.disabled = true;
        
        try {
            // Initialize PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPos = margin;
            
            // Define colors
            const colors = {
                primary: [44, 62, 80],    // #2c3e50
                secondary: [52, 152, 219], // #3498db
                accent: [41, 128, 185],   // #2980b9
                background: [248, 249, 250], // #f8f9fa
                border: [225, 229, 233],  // #e1e5e9
                white: [255, 255, 255],
                gray: [100, 100, 100]
            };
            
            // Set default font
            pdf.setFont('helvetica');
            
            // Helper function to add text with line wrapping
            const addText = (text, x, y, maxWidth, fontSize = 11, fontWeight = 'normal', color = colors.primary) => {
                pdf.setFontSize(fontSize);
                pdf.setFont(undefined, fontWeight);
                pdf.setTextColor(...color);
                
                const lines = pdf.splitTextToSize(text, maxWidth);
                pdf.text(lines, x, y);
                return lines.length * (fontSize * 0.35); // Return height used
            };
            
            // Helper function to check if we need a new page
            const checkNewPage = (neededHeight) => {
                if (yPos + neededHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPos = margin;
                    return true;
                }
                return false;
            };
            
            // Helper function to draw rounded rectangle (FIXED)
            const drawRoundedRect = (x, y, width, height, radius, fillColor = null, strokeColor = null) => {
                if (fillColor) {
                    pdf.setFillColor(...fillColor);
                    pdf.rect(x, y, width, height, 'F');
                }
                if (strokeColor) {
                    pdf.setDrawColor(...strokeColor);
                    pdf.rect(x, y, width, height, 'S');
                }
            };
            
            // ===== BLUE HEADER SECTION =====
            // Draw blue gradient header background
            const headerHeight = 50;
            pdf.setFillColor(...colors.secondary);
            pdf.rect(0, 0, pageWidth, headerHeight, 'F');
            
            // Add a subtle gradient effect (lighter top)
            pdf.setFillColor(66, 169, 234); // Lighter blue
            pdf.rect(0, 0, pageWidth, 15, 'F');
            
            // Header content
            const name = document.getElementById('resume-name').textContent;
            const title = document.getElementById('resume-title').textContent;
            
            // Name (in white)
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.white);
            pdf.text(name, margin, 30);
            
            // Title (in light white)
            pdf.setFontSize(14);
            pdf.setTextColor(255, 255, 255, 0.9);
            pdf.text(title, margin, 40);
            
            // Contact Info in header (right aligned)
            const contactInfo = document.getElementById('contact-info');
            const contactItems = Array.from(contactInfo.querySelectorAll('p'))
                .map(p => p.textContent.trim());
            
            let contactY = 30;
            contactItems.forEach(item => {
                const textWidth = pdf.getTextWidth(item);
                pdf.text(item, pageWidth - margin - textWidth, contactY);
                contactY += 5;
            });
            
            yPos = headerHeight + 10; // Start content below header
            
            // ===== MAIN CONTENT BACKGROUND =====
            pdf.setFillColor(...colors.white);
            pdf.rect(0, headerHeight, pageWidth, pageHeight - headerHeight, 'F');
            
            // ===== SUMMARY SECTION =====
            checkNewPage(30);
            
            // Section title with blue underline
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('PROFESSIONAL SUMMARY', margin, yPos);
            
            // Blue underline
            pdf.setDrawColor(...colors.secondary);
            pdf.setLineWidth(1);
            pdf.line(margin, yPos + 2, margin + 60, yPos + 2);
            
            yPos += 10;
            
            // Summary text in a light background box
            const summary = document.getElementById('summary-text').textContent;
            const summaryLines = pdf.splitTextToSize(summary, pageWidth - 2*margin);
            const summaryHeight = summaryLines.length * 4.5;
            
            // Light background for summary
            pdf.setFillColor(...colors.background);
            pdf.roundedRect(margin, yPos, pageWidth - 2*margin, summaryHeight + 10, 3, 'F');
            
            // Summary text
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(...colors.primary);
            pdf.text(summaryLines, margin + 5, yPos + 7);
            
            yPos += summaryHeight + 15;
            
            // ===== WORK EXPERIENCE =====
            checkNewPage(40);
            
            // Section title
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('WORK EXPERIENCE', margin, yPos);
            pdf.setDrawColor(...colors.secondary);
            pdf.line(margin, yPos + 2, margin + 80, yPos + 2);
            
            yPos += 10;
            
            const experienceItems = document.querySelectorAll('.experience-item');
            experienceItems.forEach((item, index) => {
                checkNewPage(50);
                
                const company = item.querySelector('h3').textContent;
                const position = item.querySelector('.job-position').textContent;
                const date = item.querySelector('.job-date').textContent;
                const responsibilities = Array.from(item.querySelectorAll('.job-responsibilities li'))
                    .map(li => '• ' + li.textContent.trim())
                    .join('\n');
                
                // Experience item background with left border
                pdf.setFillColor(...colors.background);
                pdf.rect(margin, yPos, pageWidth - 2*margin, 40, 'F');
                
                // Left blue border
                pdf.setFillColor(...colors.secondary);
                pdf.rect(margin, yPos, 4, 40, 'F');
                
                // Company and Date
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(12);
                pdf.setTextColor(...colors.primary);
                pdf.text(company, margin + 10, yPos + 8);
                
                // Date badge
                const dateWidth = pdf.getTextWidth(date);
                pdf.setFillColor(...colors.secondary);
                pdf.roundedRect(pageWidth - margin - dateWidth - 10, yPos + 2, dateWidth + 8, 10, 5, 'F');
                pdf.setTextColor(...colors.white);
                pdf.setFontSize(9);
                pdf.text(date, pageWidth - margin - dateWidth - 6, yPos + 8.5);
                
                // Position
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(11);
                pdf.setTextColor(colors.gray);
                pdf.text(position, margin + 10, yPos + 16);
                
                // Responsibilities
                pdf.setFontSize(10);
                pdf.setTextColor(...colors.primary);
                const respLines = pdf.splitTextToSize(responsibilities, pageWidth - 2*margin - 20);
                pdf.text(respLines, margin + 15, yPos + 24);
                
                const itemHeight = 20 + respLines.length * 4;
                yPos += itemHeight + 10;
                
                // Add separator between jobs
                if (index < experienceItems.length - 1) {
                    pdf.setDrawColor(...colors.border);
                    pdf.setLineWidth(0.3);
                    pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
                    yPos += 5;
                }
            });
            
            // ===== SKILLS =====
            checkNewPage(40);
            
            // Section title
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('SKILLS', margin, yPos);
            pdf.setDrawColor(...colors.secondary);
            pdf.line(margin, yPos + 2, margin + 30, yPos + 2);
            
            yPos += 10;
            
            // Skills in two columns with tag styling
            const leftColX = margin;
            const rightColX = pageWidth / 2;
            const colWidth = (pageWidth - 2*margin) / 2 - 10;
            
            const skillCategories = document.querySelectorAll('.skill-category');
            skillCategories.forEach((category, catIndex) => {
                const catTitle = category.querySelector('h4').textContent;
                const skills = Array.from(category.querySelectorAll('.skill-tag'))
                    .map(tag => tag.textContent.trim());
                
                const xPos = catIndex % 2 === 0 ? leftColX : rightColX;
                let skillY = catIndex < 2 ? yPos : yPos + 30;
                
                if (catIndex === 2) {
                    yPos += 30; // Move to next row for second column
                    skillY = yPos;
                }
                
                // Category title
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(12);
                pdf.setTextColor(...colors.primary);
                pdf.text(catTitle, xPos, skillY);
                
                // Skills as tags
                skillY += 8;
                let tagX = xPos;
                let tagY = skillY;
                
                skills.forEach((skill, skillIndex) => {
                    const tagWidth = pdf.getTextWidth(skill) + 8;
                    
                    // Check if tag fits on current line
                    if (tagX + tagWidth > xPos + colWidth) {
                        tagX = xPos;
                        tagY += 8;
                    }
                    
                    // Draw tag background
                    pdf.setFillColor(...colors.background);
                    pdf.setDrawColor(...colors.border);
                    pdf.setLineWidth(0.5);
                    pdf.roundedRect(tagX, tagY, tagWidth, 6, 3, 'F');
                    pdf.roundedRect(tagX, tagY, tagWidth, 6, 3, 'S');
                    
                    // Tag text
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'normal');
                    pdf.setTextColor(...colors.primary);
                    pdf.text(skill, tagX + 4, tagY + 4.5);
                    
                    tagX += tagWidth + 4;
                });
                
                if (catIndex === 1 || catIndex === skillCategories.length - 1) {
                    yPos = Math.max(yPos, tagY + 15);
                }
            });
            
            // ===== SIDEBAR SECTION (Right Column) =====
            pdf.addPage();
            yPos = margin;
            
            // Create sidebar background
            pdf.setFillColor(...colors.background);
            pdf.rect(pageWidth/2 + 5, margin - 10, pageWidth/2 - margin - 5, pageHeight - 2*margin + 10, 'F');
            
            // ===== LANGUAGES =====
            // Section title in sidebar
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('LANGUAGES', pageWidth/2 + 10, yPos);
            
            pdf.setDrawColor(...colors.secondary);
            pdf.setLineWidth(0.5);
            pdf.line(pageWidth/2 + 10, yPos + 2, pageWidth/2 + 70, yPos + 2);
            
            yPos += 8;
            
            const languages = document.querySelectorAll('.language-item');
            languages.forEach((lang, index) => {
                const name = lang.querySelector('.language-name').textContent;
                const level = lang.querySelector('.language-level').textContent;
                
                // Language item with border
                if (index < languages.length - 1) {
                    pdf.setDrawColor(...colors.border);
                    pdf.setLineWidth(0.3);
                    pdf.line(pageWidth/2 + 10, yPos + 5, pageWidth - margin - 10, yPos + 5);
                }
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(...colors.primary);
                pdf.text(name, pageWidth/2 + 10, yPos + 3);
                
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(...colors.secondary);
                const levelWidth = pdf.getTextWidth(level);
                pdf.text(level, pageWidth - margin - 10 - levelWidth, yPos + 3);
                
                yPos += 8;
            });
            
            yPos += 10;
            
            // ===== EDUCATION =====
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('EDUCATION', pageWidth/2 + 10, yPos);
            
            pdf.setDrawColor(...colors.secondary);
            pdf.line(pageWidth/2 + 10, yPos + 2, pageWidth/2 + 60, yPos + 2);
            
            yPos += 8;
            
            const educationItems = document.querySelectorAll('.education-item');
            educationItems.forEach((edu, index) => {
                const degree = edu.querySelector('h4').textContent;
                const institution = edu.querySelector('.education-detail').textContent;
                const date = edu.querySelector('.education-date').textContent;
                
                // Education item with border
                if (index < educationItems.length - 1) {
                    pdf.setDrawColor(...colors.border);
                    pdf.setLineWidth(0.3);
                    pdf.line(pageWidth/2 + 10, yPos + 25, pageWidth - margin - 10, yPos + 25);
                }
                
                // Degree
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(...colors.primary);
                const degreeLines = pdf.splitTextToSize(degree, pageWidth/2 - margin - 15);
                pdf.text(degreeLines, pageWidth/2 + 10, yPos + 3);
                
                // Institution
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(colors.gray);
                pdf.text(institution, pageWidth/2 + 10, yPos + 3 + degreeLines.length * 4 + 2);
                
                // Date
                pdf.setTextColor(...colors.secondary);
                pdf.text(date, pageWidth/2 + 10, yPos + 3 + degreeLines.length * 4 + 8);
                
                yPos += 20 + degreeLines.length * 4;
            });
            
            // ===== PERSONAL DETAILS =====
            yPos += 10;
            
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...colors.primary);
            pdf.text('PERSONAL DETAILS', pageWidth/2 + 10, yPos);
            
            pdf.setDrawColor(...colors.secondary);
            pdf.line(pageWidth/2 + 10, yPos + 2, pageWidth/2 + 90, yPos + 2);
            
            yPos += 8;
            
            const personalDetails = document.getElementById('personal-details');
            const details = Array.from(personalDetails.querySelectorAll('p'))
                .map(p => p.textContent.trim());
            
            details.forEach(detail => {
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(...colors.primary);
                
                // Split label and value
                const parts = detail.split(':');
                if (parts.length === 2) {
                    pdf.setFont(undefined, 'bold');
                    pdf.text(parts[0] + ':', pageWidth/2 + 10, yPos);
                    
                    const labelWidth = pdf.getTextWidth(parts[0] + ':');
                    pdf.setFont(undefined, 'normal');
                    pdf.text(parts[1], pageWidth/2 + 10 + labelWidth + 2, yPos);
                } else {
                    pdf.text(detail, pageWidth/2 + 10, yPos);
                }
                
                yPos += 7;
            });
            
            // ===== MAIN COLUMN CONTINUED =====
            // Reset to left column for any additional content
            pdf.addPage();
            yPos = margin;
            
            // ===== FOOTER =====
            // Draw footer background
            pdf.setFillColor(...colors.background);
            pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
            pdf.setDrawColor(...colors.border);
            pdf.setLineWidth(0.5);
            pdf.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
            
            // Footer text
            const footerText = document.getElementById('footer-text').textContent;
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            pdf.setFontSize(9);
            pdf.setTextColor(...colors.gray);
            pdf.text(`Generated on ${date}`, pageWidth/2, pageHeight - 15, { align: 'center' });
            pdf.text(footerText, pageWidth/2, pageHeight - 8, { align: 'center' });
            
            // Save PDF
            const cleanName = name.replace(/\s+/g, '_').replace(/[^\w\s-]/g, '');
            const filename = `${cleanName}_Professional_Resume.pdf`;
            
            pdf.save(filename);
            
            console.log('PDF with graphics and selectable text generated successfully');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please check console for details.');
        } finally {
            // Restore button
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
    
    console.log('PDF download button setup complete');
}

// Initialize the resume when the page loads
document.addEventListener('DOMContentLoaded', loadResumeData);

// Optional: Add function to update JSON from a form (for advanced use)
function updateResumeData(newData) {
    // This function could be expanded to save data back to JSON
    // Note: This requires server-side implementation for actual saving
    console.log('Data updated (simulated):', newData);
    renderResume(newData);
}

// Debug: Check if libraries are loaded
window.addEventListener('load', function() {
    console.log('Window loaded - Checking libraries...');
    console.log('html2canvas available:', typeof html2canvas !== 'undefined');
    console.log('jsPDF available:', typeof window.jspdf !== 'undefined');
    
    // Verify download button exists
    const downloadBtn = document.getElementById('download-pdf-btn');
    console.log('Download button found:', !!downloadBtn);
    
    // If download button exists but setupPDFDownload hasn't run yet, set it up
    if (downloadBtn && !downloadBtn.hasAttribute('data-pdf-setup')) {
        downloadBtn.setAttribute('data-pdf-setup', 'true');
        console.log('Manually setting up PDF download...');
    }
});
