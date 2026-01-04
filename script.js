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
    renderSkills(data.skills);
    renderLanguages(data.languages);
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
        
        // Consistent spacing constants
        const LINE_HEIGHT = 5; // Consistent line spacing for all content
        const SECTION_SPACING = 10; // Space after section titles
        const ITEM_SPACING = 8; // Space between items (jobs, education entries)

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
        sectionTitle(pdf, 'SUMMARY', left, y);
        y += SECTION_SPACING;
        
        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
        
        // Fix: Use proper line spacing for summary paragraph
        const summaryLines = pdf.splitTextToSize(data.summary, 180);
        summaryLines.forEach((line, index) => {
            pdf.text(line, left, y);
            y += LINE_HEIGHT;
        });
        y += ITEM_SPACING;

        // -------- EXPERIENCE --------
        sectionTitle(pdf, 'WORK EXPERIENCE', left, y);
        y += SECTION_SPACING;

        data.workExperience.forEach(job => {
            y = checkPageBreak(pdf, y, LINE_HEIGHT * 10); // Reserve space for next job

            // Line 1 - Company and Date
            pdf.setFont('times', 'bold');
            pdf.setFontSize(11);
            pdf.text(job.company, left, y);
            pdf.text(
                `${job.startDate} – ${job.endDate}`,
                right,
                y,
                { align: 'right' }
            );
            y += LINE_HEIGHT;

            // Line 2 - Position and Location
            pdf.setFont('times', 'normal');
            pdf.text(job.position, left, y);
            pdf.text(job.location, right, y, { align: 'right' });
            y += LINE_HEIGHT;

            // Bullets - Using consistent line spacing
            job.responsibilities.forEach(r => {
                y = checkPageBreak(pdf, y, LINE_HEIGHT * 3); // Reserve space for bullet
                
                // Split text into multiple lines if needed
                const lines = pdf.splitTextToSize(r, 170);
                
                // Draw bullet point
                pdf.text('•', left + 2, y);
                
                // Draw text with consistent line spacing
                if (lines.length === 1) {
                    pdf.text(lines[0], left + 6, y);
                    y += LINE_HEIGHT;
                } else {
                    // For multi-line bullet points
                    pdf.text(lines[0], left + 6, y);
                    y += LINE_HEIGHT;
                    
                    // Additional lines (indented)
                    for (let i = 1; i < lines.length; i++) {
                        y = checkPageBreak(pdf, y, LINE_HEIGHT);
                        pdf.text(lines[i], left + 6, y);
                        y += LINE_HEIGHT;
                    }
                }
            });

            y += ITEM_SPACING;
        });

        // Fix 2: Apply SECTION_SPACING before EDUCATION
        y += SECTION_SPACING - ITEM_SPACING; // Adjust since last job added ITEM_SPACING
        
        // -------- EDUCATION --------
        sectionTitle(pdf, 'EDUCATION', left, y);
        y += SECTION_SPACING;

        data.education.forEach(edu => {
            y = checkPageBreak(pdf, y, LINE_HEIGHT * 3); // Reserve space for education entry

            // Institution and Date
            pdf.setFont('times', 'bold');
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
            pdf.setFont('times', 'normal');
            pdf.text(edu.degree, left, y);
            y += ITEM_SPACING;
        });

        // Fix 2: Apply SECTION_SPACING before OTHERS
        y += SECTION_SPACING - ITEM_SPACING; // Adjust since last education entry added ITEM_SPACING
        
        // -------- OTHERS --------
        sectionTitle(pdf, 'OTHERS', left, y);
        y += SECTION_SPACING;
        
        // Set font size for OTHERS section content
        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
        
        // Skills bullet
        const skillsText = [...data.skills.technical, ...data.skills.professional].join(', ');
        const skillsLines = pdf.splitTextToSize(skillsText, 170 - pdf.getTextWidth('Skills: '));
        
        pdf.text('•', left + 2, y);
        pdf.setFont('times', 'bold');
        pdf.text('Skills:', left + 6, y);
        pdf.setFont('times', 'normal');
        pdf.text(skillsLines, left + 6 + pdf.getTextWidth('Skills: '), y);
        y += Math.max(skillsLines.length, 1) * LINE_HEIGHT;
        
        // Languages bullet
        y += 2; // Small spacing between bullets
        const languagesText = data.languages.map(l => `${l.name} (${l.level})`).join(', ');
        const languagesLines = pdf.splitTextToSize(languagesText, 170 - pdf.getTextWidth('Languages: '));
        
        pdf.text('•', left + 2, y);
        pdf.setFont('times', 'bold');
        pdf.text('Languages:', left + 6, y);
        pdf.setFont('times', 'normal');
        pdf.text(languagesLines, left + 6 + pdf.getTextWidth('Languages: '), y);
            
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

// Modified checkPageBreak to reserve space for upcoming content
function checkPageBreak(pdf, y, reserveHeight = 0) {
    if (y + reserveHeight > 270) { // A4 page height is 297mm, leaving margin
        pdf.addPage();
        return 20; // Return to top of new page
    }
    return y;
}

// Initialize the resume when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});
