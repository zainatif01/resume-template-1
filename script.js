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
    
    // Contact Info (ATS Template - single line)
    const contactInfo = document.getElementById('contact-info');
    contactInfo.innerHTML = `
        <p>${data.personal.email} | ${data.personal.phone} | ${data.personal.location}</p>
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
    
    // Certifications
    renderCertifications(data.certifications);
    
    // Footer
    document.getElementById('footer-text').textContent = data.footer.copyright;
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
                <h3 class="job-title">${job.position}</h3>
                <div class="job-company-info">
                    <span class="job-company">${job.company}</span>
                    <span class="job-location">${job.location}</span>
                    <span class="job-date">${job.startDate} - ${job.endDate}</span>
                </div>
            </div>
            <ul class="job-responsibilities">
                ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        `;
        container.appendChild(jobElement);
    });
}

// Function to render skills (ATS Template - simple list)
function renderSkills(skills) {
    const container = document.getElementById('skills-section');
    container.innerHTML = `
        <div class="skills-container">
            <h4>Technical Skills</h4>
            <p class="skills-list">${skills.technical.join(', ')}</p>
        </div>
        <div class="skills-container">
            <h4>Professional Skills</h4>
            <p class="skills-list">${skills.professional.join(', ')}</p>
        </div>
    `;
}

// Function to render languages (ATS Template - simple list)
function renderLanguages(languages) {
    const container = document.getElementById('languages-list');
    container.innerHTML = languages.map(lang => 
        `<span class="language-item">${lang.name} (${lang.level})</span>`
    ).join(' | ');
}

// Function to render education
function renderEducation(education) {
    const container = document.getElementById('education-list');
    container.innerHTML = education.map(edu => `
        <div class="education-item">
            <div class="education-header">
                <h4>${edu.degree}</h4>
                <span class="education-date">${edu.completionDate}</span>
            </div>
            <p class="education-institution">${edu.institution}</p>
            ${edu.honors ? `<p class="education-honors">${edu.honors}</p>` : ''}
        </div>
    `).join('');
}

// Function to render certifications
function renderCertifications(certifications) {
    const container = document.getElementById('certifications-list');
    if (certifications && certifications.length > 0) {
        container.innerHTML = `
            <h4>Certifications & Training</h4>
            <p class="certifications-list">${certifications.join(', ')}</p>
        `;
    }
}

function setupPDFDownload() {
    const downloadBtn = document.getElementById('download-pdf-btn');

    downloadBtn.addEventListener('click', async function () {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        this.disabled = true;

        try {
            const response = await fetch(`resume-data.json?version=${Date.now()}`);
            const data = await response.json();

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pageWidth = 210;
            const margin = 20;
            let y = 20;
            const lineHeight = 6;
            const contentWidth = pageWidth - (margin * 2);

            // ===== HEADER =====
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.text(data.personal.name, margin, y);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(data.personal.title, margin, y + 6);
            y += 15;
            
            // ===== CONTACT INFO =====
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`, margin, y);
            y += 10;
            
            // Draw horizontal line
            pdf.setDrawColor(33, 150, 243);
            pdf.setLineWidth(0.5);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 10;
            
            // ===== PROFESSIONAL SUMMARY =====
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 150, 243);
            pdf.text('PROFESSIONAL SUMMARY', margin, y);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            y += 7;
            y = addParagraph(pdf, data.summary, margin, y, contentWidth, lineHeight);
            
            // ===== WORK EXPERIENCE =====
            y += 8;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 150, 243);
            pdf.text('WORK EXPERIENCE', margin, y);
            y += 10;
            
            data.workExperience.forEach(job => {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.text(job.position, margin, y);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(`${job.company} | ${job.location} | ${job.startDate} - ${job.endDate}`, margin + 60, y);
                y += 5;
                
                job.responsibilities.forEach(resp => {
                    y = addParagraph(pdf, `• ${resp}`, margin + 2, y, contentWidth - 2, lineHeight);
                });
                y += 4;
            });
            
            // ===== EDUCATION =====
            y += 4;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 150, 243);
            pdf.text('EDUCATION', margin, y);
            y += 10;
            
            data.education.forEach(edu => {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.text(edu.degree, margin, y);
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.text(`${edu.institution} | ${edu.completionDate}`, margin + 60, y);
                y += 6;
                
                if (edu.honors) {
                    pdf.setFontSize(9);
                    pdf.text(edu.honors, margin, y);
                    y += 5;
                }
                y += 3;
            });
            
            // ===== SKILLS =====
            y += 4;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 150, 243);
            pdf.text('SKILLS', margin, y);
            y += 7;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            // Technical Skills
            y += 3;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Technical:', margin, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(data.skills.technical.join(', '), margin + 22, y);
            y += 5;
            
            // Professional Skills
            pdf.setFont('helvetica', 'bold');
            pdf.text('Professional:', margin, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(data.skills.professional.join(', '), margin + 27, y);
            y += 8;
            
            // ===== LANGUAGES =====
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(33, 150, 243);
            pdf.text('LANGUAGES', margin, y);
            y += 7;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.text(data.languages.map(lang => `${lang.name} (${lang.level})`).join(', '), margin, y);
            
            // ===== SAVE PDF =====
            const filename = `${data.personal.name.replace(/\s+/g, '_')}_Resume.pdf`;
            pdf.save(filename);

        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF.');
        } finally {
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
}

// ---------------- HELPER FUNCTIONS ----------------
function addParagraph(pdf, text, x, y, maxWidth, lineHeight) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
}

// Initialize the resume when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});

// Optional: Add function to update JSON from a form (for advanced use)
function updateResumeData(newData) {
    // This function could be expanded to save data back to JSON
    // Note: This requires server-side implementation for actual saving
    console.log('Data updated (simulated):', newData);
    renderResume(newData);
}
