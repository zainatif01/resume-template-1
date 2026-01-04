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
            const pageHeight = 297;
            const margin = 15;
            const mainX = 65; // main content start (after sidebar)
            let y = 40; // start y for main content
            const lineHeight = 6;

            // ===== HEADER =====
            drawHeader(pdf, data);

            // ===== SIDEBAR =====
            drawSidebar(pdf, data);

            // ===== PROFESSIONAL SUMMARY =====
            y += 0;
            coloredSectionTitle(pdf, 'PROFESSIONAL SUMMARY', mainX, y);
            y += 10;
            y = addParagraph(pdf, data.summary, mainX, y, pageWidth - mainX - margin, lineHeight);

            // ===== WORK EXPERIENCE =====
            y += 4;
            coloredSectionTitle(pdf, 'WORK EXPERIENCE', mainX, y);
            y += 10;
            data.workExperience.forEach(job => {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text(`${job.position} — ${job.company}`, mainX, y);
                y += 5;

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                pdf.text(`${job.startDate} - ${job.endDate} | ${job.location}`, mainX, y);
                y += 5;

                job.responsibilities.forEach(resp => {
                    y = addParagraph(pdf, `• ${resp}`, mainX + 2, y, pageWidth - mainX - margin, lineHeight);
                });
                y += 4;
            });

            // ===== SKILLS =====
            coloredSectionTitle(pdf, 'SKILLS', mainX, y);
            y += 10;
            let sx = mainX;
            let sy = y;

            const drawSkills = (skillsArray) => {
                skillsArray.forEach(skill => {
                    const skillWidth = pdf.getTextWidth(skill) + 6;
                    if (sx + skillWidth > pageWidth - margin) { // wrap to next line
                        sx = mainX;
                        sy += 8;
                    }
                    drawSkillTag(pdf, skill, sx, sy);
                    sx += skillWidth + 6;
                });
            };

            drawSkills(data.skills.technical);
            drawSkills(data.skills.professional);
            y = sy + 12;

            // ===== EDUCATION =====
            coloredSectionTitle(pdf, 'EDUCATION', mainX, y);
            y += 10;
            data.education.forEach(edu => {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.text(`${edu.degree} — ${edu.institution}`, mainX, y);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9);
                pdf.text(`Completed: ${edu.completionDate}`, mainX, y + 5);
                y += 12;
            });

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
function drawHeader(pdf, data) {
    pdf.setFillColor(33, 150, 243);
    pdf.rect(0, 0, 210, 30, 'F'); // full-width header

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(data.personal.name, 15, 18);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(data.personal.title, 15, 25);

    pdf.setTextColor(0, 0, 0); // reset
}

function drawSidebar(pdf, data) {
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 30, 60, 267, 'F'); // sidebar background

    let y = 45;
    const x = 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('CONTACT', x, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(data.personal.email, x, y); y += 5;
    pdf.text(data.personal.phone, x, y); y += 5;
    pdf.text(data.personal.location, x, y); y += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('LANGUAGES', x, y); y += 6;

    pdf.setFont('helvetica', 'normal');
    data.languages.forEach(lang => {
        pdf.text(`${lang.name} (${lang.level})`, x, y);
        y += 5;
    });
}

function coloredSectionTitle(pdf, text, x, y) {
    pdf.setFillColor(33, 150, 243); // blue background
    pdf.rect(x - 1, y - 5, 120, 7, 'F'); // rectangle behind text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(text, x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // reset
}

function addParagraph(pdf, text, x, y, maxWidth, lineHeight) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
}

function drawSkillTag(pdf, text, x, y) {
    const width = pdf.getTextWidth(text) + 6;
    pdf.setFillColor(220, 230, 255);
    pdf.roundedRect(x - 2, y - 4, width, 6, 2, 2, 'F');
    pdf.text(text, x, y);
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
