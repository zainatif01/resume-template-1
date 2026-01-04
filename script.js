// ===============================
// LOAD & RENDER RESUME DATA
// ===============================
async function loadResumeData() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const resumeContainer = document.getElementById('resume-content');

    try {
        const response = await fetch(`resume-data.json?version=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const resumeData = await response.json();
        renderResume(resumeData);

        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            resumeContainer.style.opacity = '1';
            resumeContainer.style.transition = 'opacity 0.8s ease';
        }, 600);

    } catch (error) {
        console.error('Error loading resume data:', error);
        document.getElementById('resume-name').textContent = 'Error loading resume';

        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            resumeContainer.style.opacity = '1';
        }, 600);
    }
}

function renderResume(data) {
    const fullName = data.personal.name;
    document.getElementById('resume-name').textContent = fullName;
    document.getElementById('resume-title').textContent = data.personal.title;
    document.title = `${fullName} - Resume`;

    document.getElementById('contact-info').innerHTML = `
        <p><i class="fas fa-envelope"></i> ${data.personal.email}</p>
        <p><i class="fas fa-phone"></i> ${data.personal.phone}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</p>
    `;

    document.getElementById('summary-text').textContent = data.summary;

    renderWorkExperience(data.workExperience);
    renderSkills(data.skills);
    renderLanguages(data.languages);
    renderEducation(data.education);

    document.getElementById('personal-details').innerHTML = `
        <p><strong>Date of Birth:</strong> ${data.personal.dateOfBirth}</p>
        <p><strong>Location:</strong> ${data.personal.location}</p>
    `;

    document.getElementById('footer-text').textContent = data.footer.copyright;
}

// ===============================
// WEB RENDER HELPERS
// ===============================
function renderWorkExperience(experience) {
    const container = document.getElementById('work-experience');
    container.innerHTML = '';

    experience.forEach(job => {
        const el = document.createElement('div');
        el.className = 'experience-item';
        el.innerHTML = `
            <div class="job-header">
                <h3>${job.company}</h3>
                <span class="job-date">${job.startDate} - ${job.endDate}</span>
            </div>
            <p class="job-position">${job.position} | ${job.location}</p>
            <ul class="job-responsibilities">
                ${job.responsibilities.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
        container.appendChild(el);
    });
}

function renderSkills(skills) {
    document.getElementById('skills-section').innerHTML = `
        <div class="skill-category">
            <h4>Technical Skills</h4>
            <div class="skill-list">
                ${skills.technical.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
        <div class="skill-category">
            <h4>Professional Skills</h4>
            <div class="skill-list">
                ${skills.professional.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderLanguages(langs) {
    document.getElementById('languages-list').innerHTML = langs.map(l => `
        <div class="language-item">
            <span class="language-name">${l.name}</span>
            <span class="language-level">${l.level}</span>
        </div>
    `).join('');
}

function renderEducation(edu) {
    document.getElementById('education-list').innerHTML = edu.map(e => `
        <div class="education-item">
            <h4>${e.degree}</h4>
            <p class="education-detail">${e.institution}</p>
            <p class="education-date">${e.completionDate}</p>
        </div>
    `).join('');
}

// ===============================
// PDF DOWNLOAD (ATS STYLE)
// ===============================
function setupPDFDownload() {
    const btn = document.getElementById('download-pdf-btn');

    btn.addEventListener('click', async function () {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        this.disabled = true;

        try {
            const response = await fetch(`resume-data.json?version=${Date.now()}`);
            const data = await response.json();

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const margin = 15;
            let y = 20;

            // NAME
            pdf.setFont("times", "bold");
            pdf.setFontSize(20);
            pdf.text(data.personal.name, margin, y);
            y += 6;

            // CONTACT
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

            // EXPERIENCE
            sectionTitle(pdf, "EXPERIENCE", margin, y);
            y += 6;

            data.workExperience.forEach(job => {
                if (y > 270) { pdf.addPage(); y = 20; }

                pdf.setFont("times", "bold");
                pdf.setFontSize(11);
                pdf.text(job.company, margin, y);
                pdf.setFont("times", "normal");
                pdf.text(`${job.startDate} - ${job.endDate}`, 195, y, { align: "right" });
                y += 5;

                pdf.setFontSize(10);
                pdf.text(`${job.position}, ${job.location}`, margin, y);
                y += 5;

                job.responsibilities.forEach(r => {
                    if (y > 280) { pdf.addPage(); y = 20; }
                    pdf.text(`- ${r}`, margin + 4, y);
                    y += 4;
                });

                y += 3;
            });

            // EDUCATION
            sectionTitle(pdf, "EDUCATION", margin, y);
            y += 6;

            data.education.forEach(e => {
                pdf.setFont("times", "bold");
                pdf.text(e.institution, margin, y);
                y += 4;

                pdf.setFont("times", "normal");
                pdf.text(`${e.degree} — ${e.completionDate}`, margin, y);
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

            pdf.save(`${data.personal.name.replace(/\s+/g, '_')}_Resume.pdf`);

        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF');
        } finally {
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });
}

// ===============================
// PDF HELPERS
// ===============================
function drawRule(pdf, y) {
    pdf.setLineWidth(0.3);
    pdf.line(15, y, 195, y);
}

function sectionTitle(pdf, text, x, y) {
    pdf.setFont("times", "bold");
    pdf.setFontSize(11);
    pdf.text(text, x, y);
    drawRule(pdf, y + 1);
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});

// Optional simulated updater
function updateResumeData(newData) {
    console.log('Data updated (simulated):', newData);
    renderResume(newData);
}
