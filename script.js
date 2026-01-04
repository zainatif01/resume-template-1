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

function setupPDFDownload() {
    const downloadBtn = document.getElementById('download-pdf-btn');
    
    downloadBtn.addEventListener('click', async function() {
        console.log('PDF generation started...');
        
        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.disabled = true;
        
        try {
            // Use html2canvas to capture the resume
            const element = document.getElementById('resume-content');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png');
            
            // Create PDF with jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate dimensions to fit the image on the page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            
            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio / 3, imgHeight * ratio / 3);
            
            // Save PDF
            const name = document.getElementById('resume-name').textContent;
            const cleanName = name.replace(/\s+/g, '_').replace(/[^\w\s-]/g, '');
            const filename = `${cleanName}_Resume.pdf`;
            
            pdf.save(filename);
            
            console.log('PDF generated successfully as image-based PDF');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        } finally {
            // Restore button
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
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
