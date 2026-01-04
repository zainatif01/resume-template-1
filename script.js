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
   
    document.getElementById('summary-text').textContent = data.summary;
    renderWorkExperience(data.workExperience);
    renderOthers(data.others); // Updated to render others section
    renderEducation(data.education);
   
    // Personal Details
    document.getElementById('personal-details').innerHTML = `
        <p><strong>Date of Birth:</strong> ${data.personal.dateOfBirth}</p>
        <p><strong>Location:</strong> ${data.personal.location}</p>
    `;
   
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

// Function to render others section (combined skills and languages)
function renderOthers(others) {
    const container = document.getElementById('others-content');
    container.innerHTML = `
        <div class="others-section">
            <h4>Skills</h4>
            <div class="skill-category">
                <h5>Technical Skills</h5>
                <div class="skill-list">
                    ${others.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="skill-category">
                <h5>Professional Skills</h5>
                <div class="skill-list">
                    ${others.skills.professional.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="others-section">
            <h4>Languages</h4>
            <div class="languages-container">
                ${others.languages.map(lang => `
                    <div class="language-item">
                        <span class="language-name">${lang.name}</span>
                        <span class="language-level">${lang.level}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
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

// ---------------- PDF ----------------
function setupPDFDownload() {
    document.getElementById('download-pdf-btn')
        .addEventListener('click', async () => {
        try {
            const res = await fetch(`resume-data.json?version=${Date.now()}`);
            const data = await res.json();

            // Check if jsPDF is loaded properly
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF library not loaded. Please check the script URL.');
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const left = 15;
            const right = 195;
            let y = 20;
            
            // Consistent spacing constants
            const LINE_HEIGHT = 5;
            const SECTION_SPACING = 10;
            const SECTION_GAP = 8;
            const ITEM_SPACING = 4;

            // -------- HEADER --------
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.text(data.personal.name, left, y);
            y += 6;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const contactText = `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`;
            pdf.text(contactText, left, y);
            y += SECTION_GAP;

            // -------- SUMMARY --------
            drawSectionTitle(pdf, 'SUMMARY', left, y);
            y += SECTION_SPACING;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            
            // Clean summary text and split into lines
            const cleanSummary = data.summary.replace(/[^\x00-\x7F]/g, '');
            const summaryLines = pdf.splitTextToSize(cleanSummary, 180);
            
            summaryLines.forEach((line, index) => {
                if (index > 0 && y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, left, y);
                y += LINE_HEIGHT;
            });
            
            y += SECTION_GAP;

            // -------- WORK EXPERIENCE --------
            drawSectionTitle(pdf, 'WORK EXPERIENCE', left, y);
            y += SECTION_SPACING;

            data.workExperience.forEach((job, jobIndex) => {
                if (y > 250) {
                    pdf.addPage();
                    y = 20;
                }

                // Company and Date
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text(job.company, left, y);
                pdf.text(
                    `${job.startDate} – ${job.endDate}`,
                    right,
                    y,
                    { align: 'right' }
                );
                y += LINE_HEIGHT;

                // Position and Location
                pdf.setFont('helvetica', 'normal');
                const positionText = `${job.position} | ${job.location}`;
                pdf.text(positionText, left, y);
                y += LINE_HEIGHT;

                // Responsibilities
                job.responsibilities.forEach(resp => {
                    if (y > 270) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    const cleanResp = resp.replace(/[^\x00-\x7F]/g, '');
                    const lines = pdf.splitTextToSize(cleanResp, 170);
                    
                    // First line with bullet
                    pdf.setFont('helvetica', 'normal');
                    pdf.text('•', left, y);
                    pdf.text(lines[0], left + 4, y);
                    y += LINE_HEIGHT;
                    
                    // Additional lines (indented)
                    for (let i = 1; i < lines.length; i++) {
                        if (y > 270) {
                            pdf.addPage();
                            y = 20;
                        }
                        pdf.text(lines[i], left + 4, y);
                        y += LINE_HEIGHT;
                    }
                });

                // Space between jobs (except after last one)
                if (jobIndex < data.workExperience.length - 1) {
                    y += ITEM_SPACING;
                }
            });

            y += SECTION_GAP;

            // -------- EDUCATION --------
            drawSectionTitle(pdf, 'EDUCATION', left, y);
            y += SECTION_SPACING;

            data.education.forEach((edu, index) => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }

                // Institution and Date
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text(edu.institution, left, y);
                pdf.text(
                    edu.completionDate,
                    right,
                    y,
                    { align: 'right' }
                );
                y += LINE_HEIGHT;

                // Degree
                pdf.setFont('helvetica', 'normal');
                pdf.text(edu.degree, left, y);
                
                // Space between education items
                if (index < data.education.length - 1) {
                    y += ITEM_SPACING;
                }
            });

            y += SECTION_GAP;

            // -------- OTHERS --------
            drawSectionTitle(pdf, 'OTHERS', left, y);
            y += SECTION_SPACING;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            
            // Skills
            pdf.setFont('helvetica', 'bold');
            pdf.text('Skills:', left, y);
            y += LINE_HEIGHT;
            
            // Technical Skills
            pdf.setFont('helvetica', 'normal');
            const techSkills = data.others.skills.technical.join(', ');
            const techLines = pdf.splitTextToSize(techSkills, 180);
            techLines.forEach(line => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, left + 4, y);
                y += LINE_HEIGHT;
            });
            
            y += 2; // Small gap
            
            // Professional Skills
            pdf.setFont('helvetica', 'bold');
            pdf.text('Professional:', left, y);
            y += LINE_HEIGHT;
            
            pdf.setFont('helvetica', 'normal');
            const profSkills = data.others.skills.professional.join(', ');
            const profLines = pdf.splitTextToSize(profSkills, 180);
            profLines.forEach(line => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, left + 4, y);
                y += LINE_HEIGHT;
            });
            
            y += SECTION_GAP;
            
            // Languages
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.text('Languages:', left, y);
            y += LINE_HEIGHT;
            
            pdf.setFont('helvetica', 'normal');
            const languagesText = data.others.languages.map(l => `${l.name} (${l.level})`).join(', ');
            const langLines = pdf.splitTextToSize(languagesText, 180);
            langLines.forEach(line => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, left + 4, y);
                y += LINE_HEIGHT;
            });

            // Save the PDF
            const fileName = `${data.personal.name.replace(/\s+/g, '_')}_Resume.pdf`;
            pdf.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please check console for details.');
        }
    });
}

// ---------------- HELPERS ----------------
function drawSectionTitle(pdf, text, x, y) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(text, x, y);
    pdf.setLineWidth(0.4);
    pdf.line(15, y + 2, 195, y + 2);
}

// Initialize the resume when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});
