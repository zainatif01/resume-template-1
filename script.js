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
            const margin = 15;
            let y = 20;
            
            // NAME
            pdf.setFont("times", "bold");
            pdf.setFontSize(20);
            pdf.text(data.personal.name, margin, y);
            y += 6;
            
            // CONTACT LINE
            pdf.setFont("times", "normal");
            pdf.setFontSize(10);
            pdf.text(
              `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`,
              margin,
              y
            );
            y += 8;
            
            drawRule(pdf, y);
            y += 6;
            
            // SECTION: EXPERIENCE
            sectionTitle(pdf, "EXPERIENCE", margin, y);
            y += 6;
            
            data.workExperience.forEach(job => {
                pdf.setFont("times", "bold");
                pdf.setFontSize(11);
                pdf.text(job.company, margin, y);
            
                pdf.setFont("times", "normal");
                pdf.text(`${job.startDate} - ${job.endDate}`, 150, y);
                y += 5;
            
                pdf.setFontSize(10);
                pdf.text(`${job.position}, ${job.location}`, margin, y);
                y += 5;
            
                job.responsibilities.forEach(r => {
                    pdf.text(`- ${r}`, margin + 4, y);
                    y += 4;
                });
            
                y += 3;
            });
            
            // EDUCATION
            sectionTitle(pdf, "EDUCATION", margin, y);
            y += 6;
            
            data.education.forEach(edu => {
                pdf.setFont("times", "bold");
                pdf.text(edu.institution, margin, y);
                y += 4;
            
                pdf.setFont("times", "normal");
                pdf.text(`${edu.degree} — ${edu.completionDate}`, margin, y);
                y += 6;
            });
            
            // SKILLS
            sectionTitle(pdf, "SKILLS", margin, y);
            y += 6;
            
            pdf.text(
              [...data.skills.technical, ...data.skills.professional].join(", "),
              margin,
              y,
              { maxWidth: 180 }
            );
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
