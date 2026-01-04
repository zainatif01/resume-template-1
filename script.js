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
// ---------------- PDF ----------------
function setupPDFDownload() {
    document.getElementById('download-pdf-btn')
        .addEventListener('click', async () => {

        const res = await fetch(`resume-data.json?version=${Date.now()}`);
        const data = await res.json();

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const left = 15;
        const right = 195;
        let y = 20;

        // -------- HEADER --------
        pdf.setFont('times', 'bold');
        pdf.setFontSize(20);
        pdf.text(data.personal.name, left, y);
        y += 6;

        pdf.setFont('times', 'normal');
        pdf.setFontSize(10);
        pdf.text(
            `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`,
            left,
            y
        );
        y += 12;

        // -------- SUMMARY --------
        sectionTitle(pdf, 'PROFESSIONAL SUMMARY', left, y);
        y += 8;

        y = addParagraph(pdf, data.summary, left, y, 180, 4);
        y += 10;

        // -------- EXPERIENCE --------
        sectionTitle(pdf, 'WORK EXPERIENCE', left, y);
        y += 10;

        data.workExperience.forEach(job => {
            y = checkPageBreak(pdf, y);

            // Line 1
            pdf.setFont('times', 'bold');
            pdf.setFontSize(11);
            pdf.text(job.company, left, y);
            pdf.text(
                `${formatDate(job.startDate)} – ${formatDate(job.endDate)}`,
                right,
                y,
                { align: 'right' }
            );
            y += 5;

            // Line 2
            pdf.setFont('times', 'normal');
            pdf.text(job.position, left, y);
            pdf.text(job.location, right, y, { align: 'right' });
            y += 5;

            // Bullets
            job.responsibilities.forEach(r => {
                y = checkPageBreak(pdf, y);
                pdf.text('•', left + 2, y);
                pdf.text(r, left + 6, y, { maxWidth: 170 });
                y += 4;
            });

            y += 8;
        });

        // -------- EDUCATION --------
        sectionTitle(pdf, 'EDUCATION', left, y);
        y += 10;

        data.education.forEach(edu => {
            y = checkPageBreak(pdf, y);

            pdf.setFont('times', 'bold');
            pdf.text(edu.institution, left, y);
            pdf.text(
                formatDate(edu.completionDate),
                right,
                y,
                { align: 'right' }
            );
            y += 5;

            pdf.setFont('times', 'normal');
            pdf.text(edu.degree, left, y);
            y += 8;
        });

        // -------- OTHERS --------
        sectionTitle(pdf, 'OTHERS', left, y);
        y += 10;

        pdf.setFont('times', 'bold');
        pdf.text('• Skills:', left, y);
        pdf.setFont('times', 'normal');
        pdf.text(
            [...data.skills.technical, ...data.skills.professional].join(', '),
            left + 25,
            y,
            { maxWidth: 155 }
        );
        y += 6;

        pdf.setFont('times', 'bold');
        pdf.text('• Languages:', left, y);
        pdf.setFont('times', 'normal');
        pdf.text(
            data.languages.map(l => `${l.name} (${l.level})`).join(', '),
            left + 30,
            y,
            { maxWidth: 150 }
        );

        pdf.save(`${data.personal.name.replace(/\s+/g, '_')}_Resume.pdf`);
    });
}

// ---------------- HELPERS ----------------
function sectionTitle(pdf, text, x, y) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.text(text, x, y);
    drawRule(pdf, y + 2);
}

function drawRule(pdf, y) {
    pdf.setLineWidth(0.4);
    pdf.line(15, y, 195, y);
}

function addParagraph(pdf, text, x, y, width, lh) {
    const lines = pdf.splitTextToSize(text, width);
    pdf.text(lines, x, y);
    return y + lines.length * lh;
}

function checkPageBreak(pdf, y) {
    if (y > 270) {
        pdf.addPage();
        return 20;
    }
    return y;
}

// Initialize the resume when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});
