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
    
    // Setup download button after resume is rendered
    setTimeout(setupDownloadButton, 100);
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

// High-quality PDF generation function
async function generateHighQualityPDF() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const originalButton = document.querySelector('.download-btn');
    const originalButtonHTML = originalButton.innerHTML;
    
    try {
        // Show loading overlay for PDF generation
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.remove('hidden');
        
        // Update button to show processing state
        originalButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        originalButton.disabled = true;
        
        // Clone the resume container for PDF generation
        const element = document.getElementById('resume-content');
        const clone = element.cloneNode(true);
        
        // Remove the download button from the clone
        const cloneDownloadBtn = clone.querySelector('.download-btn');
        if (cloneDownloadBtn) {
            cloneDownloadBtn.remove();
        }
        
        // Apply PDF-specific styles to the clone
        clone.style.width = '1000px';
        clone.style.maxWidth = '1000px';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';
        
        // Create a temporary container for PDF generation
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-export-container';
        pdfContainer.style.position = 'fixed';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '-9999px';
        pdfContainer.style.width = '1000px';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.padding = '40px';
        pdfContainer.appendChild(clone);
        document.body.appendChild(pdfContainer);
        
        // Configure html2canvas options for high quality
        const canvasOptions = {
            scale: 2, // Double resolution for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true,
            removeContainer: true,
            onclone: function(doc) {
                // Ensure all styles are properly applied
                const pdfElement = doc.querySelector('.pdf-export-container');
                if (pdfElement) {
                    pdfElement.style.width = '1000px';
                    pdfElement.style.maxWidth = '1000px';
                }
                
                // Inject print styles
                const style = doc.createElement('style');
                style.innerHTML = `
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    * {
                        font-family: 'Inter', sans-serif !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body, html { margin: 0; padding: 0; }
                    .download-section { display: none !important; }
                `;
                doc.head.appendChild(style);
            }
        };
        
        // Generate canvas from the clone
        const canvas = await html2canvas(pdfContainer, canvasOptions);
        
        // Clean up temporary container
        document.body.removeChild(pdfContainer);
        
        // Calculate PDF dimensions (A4: 210mm x 297mm, 1mm ≈ 3.78px)
        const pdfWidth = 210; // mm
        const pdfHeight = 297; // mm
        const scaleToPx = 3.78;
        
        // Calculate image dimensions to fit A4 with margins
        const margin = 10; // mm margin on each side
        const maxWidth = (pdfWidth - (margin * 2)) * scaleToPx;
        const maxHeight = (pdfHeight - (margin * 2)) * scaleToPx;
        
        // Calculate scaling to fit within A4
        const scale = Math.min(
            maxWidth / canvas.width,
            maxHeight / canvas.height,
            1
        );
        
        const imgWidth = canvas.width * scale;
        const imgHeight = canvas.height * scale;
        
        // Convert dimensions to mm for PDF
        const imgWidthMM = imgWidth / scaleToPx;
        const imgHeightMM = imgHeight / scaleToPx;
        
        // Calculate position to center on page
        const xPos = (pdfWidth - imgWidthMM) / 2;
        const yPos = (pdfHeight - imgHeightMM) / 2;
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', xPos, yPos, imgWidthMM, imgHeightMM);
        
        // Add footer with generation date
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on ${date}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
        
        // Save PDF with personalized filename
        const name = document.getElementById('resume-name').textContent || 'resume';
        const cleanName = name.replace(/\s+/g, '_').replace(/[^\w\s-]/g, '');
        const filename = `${cleanName}_Resume.pdf`;
        
        pdf.save(filename);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        // Restore button state
        if (originalButton) {
            originalButton.innerHTML = originalButtonHTML;
            originalButton.disabled = false;
        }
        
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 600);
    }
}

// Setup download button functionality
function setupDownloadButton() {
    const downloadBtn = document.querySelector('.download-btn');
    
    if (!downloadBtn) {
        console.warn('Download button not found');
        return;
    }
    
    // Remove any existing event listeners by cloning the button
    const newBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
    
    // Set up new event listener
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        generateHighQualityPDF();
    });
    
    // Update button text and icon
    newBtn.innerHTML = '<i class="fas fa-download"></i> Generate PDF Resume';
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

// Optional: Add a print-friendly version button
function addPrintButton() {
    const downloadSection = document.querySelector('.download-section');
    if (downloadSection && !document.querySelector('#print-btn')) {
        const printBtn = document.createElement('button');
        printBtn.id = 'print-btn';
        printBtn.className = 'print-btn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Resume';
        printBtn.style.marginTop = '10px';
        printBtn.style.width = '100%';
        printBtn.style.padding = '0.75rem 1.5rem';
        printBtn.style.background = '#666';
        printBtn.style.color = 'white';
        printBtn.style.border = 'none';
        printBtn.style.borderRadius = '6px';
        printBtn.style.cursor = 'pointer';
        printBtn.style.fontWeight = '500';
        printBtn.style.transition = 'all 0.2s ease';
        
        printBtn.addEventListener('mouseenter', () => {
            printBtn.style.background = '#555';
            printBtn.style.transform = 'translateY(-2px)';
        });
        
        printBtn.addEventListener('mouseleave', () => {
            printBtn.style.background = '#666';
            printBtn.style.transform = 'translateY(0)';
        });
        
        printBtn.addEventListener('click', () => {
            window.print();
        });
        
        downloadSection.appendChild(printBtn);
    }
}

// Add print button when resume is loaded
setTimeout(addPrintButton, 2000);
