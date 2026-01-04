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
    
    // Add print button after resume is rendered
    setTimeout(addPrintButton, 200);
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

// PDF Download Functionality
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
            const element = document.getElementById('resume-content');
            
            // Create canvas with optimized settings
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                onclone: function(clonedDoc) {
                    // Hide the download button in the cloned version
                    const clonedDownloadBtn = clonedDoc.querySelector('.download-btn');
                    if (clonedDownloadBtn) {
                        clonedDownloadBtn.style.display = 'none';
                    }
                    
                    // Hide the print button in the cloned version
                    const clonedPrintBtn = clonedDoc.querySelector('.print-btn');
                    if (clonedPrintBtn) {
                        clonedPrintBtn.style.display = 'none';
                    }
                    
                    // Ensure all fonts are loaded
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                        * {
                            font-family: 'Inter', sans-serif !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Calculate image dimensions to fit A4 page
            const imgWidth = 190; // A4 width (210mm) minus 20mm margins
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const imgData = canvas.toDataURL('image/png');
            
            // Add image to PDF (centered horizontally)
            const xPos = 10; // 10mm left margin
            const yPos = 10; // 10mm top margin
            pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
            
            // Add footer with generation date
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on ${date}`, 105, 290, { align: 'center' });
            
            // Save PDF with personalized filename
            const name = document.getElementById('resume-name').textContent || 'resume';
            const cleanName = name.replace(/\s+/g, '_').replace(/[^\w\s-]/g, '');
            const filename = `${cleanName}_Resume.pdf`;
            
            pdf.save(filename);
            
            console.log('PDF generated successfully');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating PDF. Please check console for details.');
        } finally {
            // Restore button
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
    
    console.log('PDF download button setup complete');
}

// Print button with improved print handling
function addPrintButton() {
    const downloadSection = document.querySelector('.download-section');
    if (downloadSection && !document.querySelector('#print-btn')) {
        const printBtn = document.createElement('button');
        printBtn.id = 'print-btn';
        printBtn.className = 'print-btn';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Resume';
        
        printBtn.addEventListener('click', (e) => {
            e.preventDefault();
            printResume();
        });
        
        downloadSection.appendChild(printBtn);
        console.log('Print button added');
    }
}

// Improved print function
function printResume() {
    console.log('Printing resume...');
    
    const originalButton = document.getElementById('print-btn');
    const originalButtonHTML = originalButton.innerHTML;
    
    try {
        // Show loading state
        originalButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        originalButton.disabled = true;
        
        // Get the resume content
        const resumeContent = document.getElementById('resume-content').innerHTML;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for this site to print.');
        }
        
        // Create print-optimized HTML
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Resume - Print</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    /* Reset for print */
                    @page {
                        margin: 0 !important;
                        padding: 0 !important;
                        size: A4 portrait;
                    }
                    
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        font-family: 'Inter', sans-serif !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                    }
                    
                    /* Hide non-print elements */
                    .download-section,
                    .print-btn,
                    .download-btn {
                        display: none !important;
                    }
                    
                    /* Resume container styles */
                    .resume-container {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        background: white !important;
                    }
                    
                    .header {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%) !important;
                    }
                    
                    .resume-content {
                        padding: 20px !important;
                    }
                    
                    /* Page break control */
                    .section, .experience-item, .sidebar-section {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* Ensure colors print */
                    .skill-tag,
                    .job-date {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    /* Print-specific overrides */
                    @media print {
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        /* Remove any browser-added headers/footers */
                        @page {
                            margin: 0 !important;
                            size: A4;
                        }
                    }
                </style>
            </head>
            <body>
                ${resumeContent}
                <script>
                    // Auto-print and close when ready
                    window.onload = function() {
                        // Small delay to ensure styles are applied
                        setTimeout(function() {
                            window.print();
                            
                            // Close window after printing
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }, 500);
                    };
                    
                    // Fallback in case print dialog is cancelled
                    window.onafterprint = function() {
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        console.log('Print window opened successfully');
        
    } catch (error) {
        console.error('Error printing resume:', error);
        alert('Error printing: ' + error.message);
        
        // Fallback to basic print if new window fails
        setTimeout(() => {
            window.print();
        }, 100);
        
    } finally {
        // Restore button state
        if (originalButton) {
            setTimeout(() => {
                originalButton.innerHTML = originalButtonHTML;
                originalButton.disabled = false;
            }, 2000);
        }
    }
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
