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

// PDF Download Functionality with Selectable Text
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
            
            // Set font
            pdf.setFont('helvetica');
            
            // Helper function to add text with line wrapping
            const addText = (text, x, y, maxWidth, fontSize = 11, fontWeight = 'normal') => {
                pdf.setFontSize(fontSize);
                pdf.setFont(undefined, fontWeight);
                
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
            
            // ===== HEADER SECTION =====
            const name = document.getElementById('resume-name').textContent;
            const title = document.getElementById('resume-title').textContent;
            
            // Name
            yPos += addText(name, margin, yPos, pageWidth - 2*margin, 24, 'bold');
            yPos += 5;
            
            // Title
            yPos += addText(title, margin, yPos, pageWidth - 2*margin, 14);
            yPos += 10;
            
            // Contact Info
            const contactInfo = document.getElementById('contact-info');
            const contactText = Array.from(contactInfo.querySelectorAll('p'))
                .map(p => p.textContent.trim())
                .join(' | ');
            
            yPos += addText(contactText, margin, yPos, pageWidth - 2*margin, 10);
            yPos += 15;
            
            // ===== SUMMARY SECTION =====
            checkNewPage(20);
            const summary = document.getElementById('summary-text').textContent;
            yPos += addText('PROFESSIONAL SUMMARY', margin, yPos, pageWidth - 2*margin, 14, 'bold');
            yPos += 5;
            
            pdf.setDrawColor(52, 152, 219);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;
            
            yPos += addText(summary, margin, yPos, pageWidth - 2*margin, 11);
            yPos += 15;
            
            // ===== WORK EXPERIENCE =====
            checkNewPage(20);
            yPos += addText('WORK EXPERIENCE', margin, yPos, pageWidth - 2*margin, 14, 'bold');
            yPos += 5;
            
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            const experienceItems = document.querySelectorAll('.experience-item');
            experienceItems.forEach((item, index) => {
                checkNewPage(30);
                
                const company = item.querySelector('h3').textContent;
                const position = item.querySelector('.job-position').textContent;
                const date = item.querySelector('.job-date').textContent;
                const responsibilities = Array.from(item.querySelectorAll('.job-responsibilities li'))
                    .map(li => '• ' + li.textContent.trim())
                    .join('\n');
                
                // Company and Date
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(12);
                pdf.text(company, margin, yPos);
                
                const dateWidth = pdf.getTextWidth(date);
                pdf.text(date, pageWidth - margin - dateWidth, yPos);
                yPos += 7;
                
                // Position
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(11);
                yPos += addText(position, margin, yPos, pageWidth - 2*margin, 11);
                yPos += 5;
                
                // Responsibilities
                pdf.setFontSize(10);
                const respLines = pdf.splitTextToSize(responsibilities, pageWidth - 2*margin - 10);
                pdf.text(respLines, margin + 5, yPos);
                yPos += respLines.length * 4;
                yPos += 10;
                
                // Add separator between jobs (except last)
                if (index < experienceItems.length - 1) {
                    pdf.setDrawColor(225, 229, 233);
                    pdf.setLineWidth(0.3);
                    pdf.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
                    yPos += 5;
                }
            });
            
            // ===== SKILLS =====
            checkNewPage(30);
            yPos += addText('SKILLS', margin, yPos, pageWidth - 2*margin, 14, 'bold');
            yPos += 5;
            
            pdf.setDrawColor(52, 152, 219);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            // Skills in two columns
            const leftColX = margin;
            const rightColX = pageWidth / 2;
            const colWidth = (pageWidth - 2*margin) / 2 - 10;
            
            const skillCategories = document.querySelectorAll('.skill-category');
            skillCategories.forEach((category, catIndex) => {
                const catTitle = category.querySelector('h4').textContent;
                const skills = Array.from(category.querySelectorAll('.skill-tag'))
                    .map(tag => tag.textContent.trim())
                    .join(', ');
                
                const xPos = catIndex % 2 === 0 ? leftColX : rightColX;
                const currentY = catIndex < 2 ? yPos : yPos + 25;
                
                if (catIndex === 2) {
                    yPos += 25; // Move to next row for second column
                }
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(11);
                pdf.text(catTitle, xPos, currentY);
                
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                const skillLines = pdf.splitTextToSize(skills, colWidth);
                pdf.text(skillLines, xPos, currentY + 6);
                
                if (catIndex === 1 || catIndex === skillCategories.length - 1) {
                    yPos += Math.max(6 + skillLines.length * 4, 20);
                }
            });
            
            // ===== LANGUAGES & EDUCATION (Side by side on last page) =====
            pdf.addPage();
            yPos = margin;
            
            // Languages in left column
            yPos += addText('LANGUAGES', margin, yPos, pageWidth/2 - margin - 5, 14, 'bold');
            yPos += 5;
            
            pdf.setDrawColor(52, 152, 219);
            pdf.line(margin, yPos, pageWidth/2 - 5, yPos);
            yPos += 10;
            
            const languages = document.querySelectorAll('.language-item');
            languages.forEach(lang => {
                const name = lang.querySelector('.language-name').textContent;
                const level = lang.querySelector('.language-level').textContent;
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(11);
                pdf.text(name, margin, yPos);
                
                pdf.setFont(undefined, 'normal');
                const levelWidth = pdf.getTextWidth(level);
                pdf.text(level, pageWidth/2 - 5 - levelWidth, yPos);
                yPos += 7;
            });
            
            // Education in right column
            let yPosRight = margin;
            yPosRight += addText('EDUCATION', pageWidth/2 + 5, yPosRight, pageWidth/2 - margin - 5, 14, 'bold');
            yPosRight += 5;
            
            pdf.setDrawColor(52, 152, 219);
            pdf.line(pageWidth/2 + 5, yPosRight, pageWidth - margin, yPosRight);
            yPosRight += 10;
            
            const educationItems = document.querySelectorAll('.education-item');
            educationItems.forEach(edu => {
                const degree = edu.querySelector('h4').textContent;
                const institution = edu.querySelector('.education-detail').textContent;
                const date = edu.querySelector('.education-date').textContent;
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(11);
                const degreeLines = pdf.splitTextToSize(degree, pageWidth/2 - margin - 10);
                pdf.text(degreeLines, pageWidth/2 + 5, yPosRight);
                yPosRight += degreeLines.length * 4 + 2;
                
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                yPosRight += addText(institution, pageWidth/2 + 5, yPosRight, pageWidth/2 - margin - 10, 10);
                yPosRight += addText(date, pageWidth/2 + 5, yPosRight, pageWidth/2 - margin - 10, 10);
                yPosRight += 10;
            });
            
            // ===== PERSONAL DETAILS =====
            yPos = Math.max(yPos, yPosRight) + 10;
            checkNewPage(20);
            
            yPos += addText('PERSONAL DETAILS', margin, yPos, pageWidth - 2*margin, 14, 'bold');
            yPos += 5;
            
            pdf.setDrawColor(52, 152, 219);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            const personalDetails = document.getElementById('personal-details');
            const details = Array.from(personalDetails.querySelectorAll('p'))
                .map(p => p.textContent.trim());
            
            details.forEach(detail => {
                yPos += addText(detail, margin, yPos, pageWidth - 2*margin, 11);
                yPos += 6;
            });
            
            // ===== FOOTER =====
            const footerText = document.getElementById('footer-text').textContent;
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on ${date}`, pageWidth/2, pageHeight - 10, { align: 'center' });
            pdf.text(footerText, pageWidth/2, pageHeight - 5, { align: 'center' });
            
            // Save PDF
            const cleanName = name.replace(/\s+/g, '_').replace(/[^\w\s-]/g, '');
            const filename = `${cleanName}_Resume_Selectable.pdf`;
            
            pdf.save(filename);
            
            console.log('PDF with selectable text generated successfully');
            
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
