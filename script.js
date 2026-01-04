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
            printResumeOptimized();
        });
        
        downloadSection.appendChild(printBtn);
        console.log('Print button added');
    }
}

// Optimized print function using JavaScript approach
function printResumeOptimized() {
    console.log('Starting optimized print...');
    
    const printBtn = document.getElementById('print-btn');
    const originalButtonHTML = printBtn.innerHTML;
    
    try {
        // Show loading state
        printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        printBtn.disabled = true;
        
        // Store original styles and classes
        const originalBodyStyle = document.body.style.cssText;
        const originalResumeContainerStyle = document.querySelector('.resume-container').style.cssText;
        const originalDownloadSection = document.querySelector('.download-section');
        const originalDownloadSectionDisplay = originalDownloadSection ? originalDownloadSection.style.display : '';
        
        // Hide download section for print
        if (originalDownloadSection) {
            originalDownloadSection.style.display = 'none';
        }
        
        // Apply print-optimized styles
        const printStyle = document.createElement('style');
        printStyle.id = 'print-optimized-styles';
        printStyle.innerHTML = `
            /* Print optimization styles */
            @media print {
                /* Remove all margins and paddings */
                @page {
                    margin: 0 !important;
                    padding: 0 !important;
                    size: A4 portrait;
                }
                
                /* Reset body for print */
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 210mm !important;
                    min-height: 297mm !important;
                    background: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                /* Style resume container for print */
                .resume-container {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 auto !important;
                    padding: 15mm !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    background: white !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                
                /* Ensure gradient prints */
                .header {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%) !important;
                }
                
                /* Prevent page breaks in important sections */
                .section,
                .experience-item,
                .sidebar-section,
                .education-item {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                
                /* Hide non-print elements */
                .download-section {
                    display: none !important;
                }
                
                /* Ensure colors print correctly */
                .skill-tag,
                .job-date {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
            
            /* Apply some styles immediately for preview */
            body.printing-mode {
                background: white !important;
                padding: 0 !important;
            }
            
            .printing-mode .resume-container {
                box-shadow: none !important;
                margin: 20px auto !important;
            }
            
            .printing-mode .download-section {
                display: none !important;
            }
        `;
        
        document.head.appendChild(printStyle);
        
        // Add printing mode class
        document.body.classList.add('printing-mode');
        
        // Adjust resume container for better print preview
        const resumeContainer = document.querySelector('.resume-container');
        if (resumeContainer) {
            resumeContainer.style.boxShadow = 'none';
            resumeContainer.style.margin = '20px auto';
        }
        
        // Small delay to ensure styles are applied
        setTimeout(() => {
            // Trigger print dialog
            window.print();
            
            // Cleanup after print
            cleanupPrintStyles();
            
        }, 300);
        
    } catch (error) {
        console.error('Error during print:', error);
        alert('Error preparing print. Please try again.');
        cleanupPrintStyles();
    } finally {
        // Restore button after a delay (in case print dialog takes time)
        setTimeout(() => {
            printBtn.innerHTML = originalButtonHTML;
            printBtn.disabled = false;
        }, 2000);
    }
    
    // Function to cleanup print styles
    function cleanupPrintStyles() {
        // Remove print styles
        const printStyleElement = document.getElementById('print-optimized-styles');
        if (printStyleElement) {
            printStyleElement.remove();
        }
        
        // Remove printing mode class
        document.body.classList.remove('printing-mode');
        
        // Restore original styles
        document.body.style.cssText = originalBodyStyle;
        
        const resumeContainer = document.querySelector('.resume-container');
        if (resumeContainer) {
            resumeContainer.style.cssText = originalResumeContainerStyle;
        }
        
        // Restore download section
        const downloadSection = document.querySelector('.download-section');
        if (downloadSection && originalDownloadSectionDisplay !== undefined) {
            downloadSection.style.display = originalDownloadSectionDisplay;
        }
        
        console.log('Print styles cleaned up');
    }
}

// Alternative simple print function (fallback)
function simplePrint() {
    console.log('Using simple print...');
    window.print();
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

// Handle browser print events
window.addEventListener('beforeprint', function() {
    console.log('Before print event fired');
    document.body.classList.add('print-active');
});

window.addEventListener('afterprint', function() {
    console.log('After print event fired');
    document.body.classList.remove('print-active');
});
