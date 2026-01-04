// Function to load and parse the JSON data
async function loadResumeData() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const resumeContainer = document.getElementById('resume-content');

    try {
        const response = await fetch(`resume-data.json?version=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load JSON');

        const resumeData = await response.json();
        renderResume(resumeData);

        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            resumeContainer.style.opacity = '1';
        }, 600);

    } catch (error) {
        console.error(error);
        loadingOverlay.style.display = 'none';
        resumeContainer.style.opacity = '1';
    }
}

// ---------------- RENDER FUNCTIONS ----------------

function renderResume(data) {
    document.getElementById('resume-name').textContent = data.personal.name;
    document.getElementById('resume-title').textContent = data.personal.title;
    document.title = `${data.personal.name} - Resume`;

    document.getElementById('contact-info').innerHTML = `
        <p>${data.personal.email}</p>
        <p>${data.personal.phone}</p>
        <p>${data.personal.location}</p>
    `;

    document.getElementById('summary-text').textContent = data.summary;

    renderWorkExperience(data.workExperience);
    renderSkills(data.skills);
    renderLanguages(data.languages);
    renderEducation(data.education);

    document.getElementById('footer-text').textContent =
        data.footer?.copyright || '';
}

function renderWorkExperience(experience) {
    const container = document.getElementById('work-experience');
    container.innerHTML = '';

    experience.forEach(job => {
        const el = document.createElement('div');
        el.className = 'experience-item';
        el.innerHTML = `
            <strong>${job.company}</strong>
            <span>${job.startDate} - ${job.endDate}</span>
            <p>${job.position} | ${job.location}</p>
            <ul>
                ${job.responsibilities.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
        container.appendChild(el);
    });
}

function renderSkills(skills) {
    document.getElementById('skills-section').innerHTML = `
        <p>${[...skills.technical, ...skills.professional].join(', ')}</p>
    `;
}

function renderLanguages(languages) {
    document.getElementById('languages-list').innerHTML =
        languages.map(l => `<p>${l.name} – ${l.level}</p>`).join('');
}

function renderEducation(education) {
    document.getElementById('education-list').innerHTML =
        education.map(e => `
            <p><strong>${e.degree}</strong> — ${e.institution} (${e.completionDate})</p>
        `).join('');
}

// ---------------- PDF GENERATION ----------------

function setupPDFDownload() {
    const btn = document.getElementById('download-pdf-btn');

    btn.addEventListener('click', async function () {
        const originalText = this.innerHTML;
        this.innerHTML = 'Generating PDF...';
        this.disabled = true;

        try {
            const res = await fetch(`resume-data.json?version=${Date.now()}`);
            const data = await res.json();

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const margin = 15;
            const right = 195;
            let y = 20;

            // ---------- HEADER ----------
            pdf.setFont('times', 'bold');
            pdf.setFontSize(20);
            pdf.text(data.personal.name, margin, y);
            y += 6;

            pdf.setFont('times', 'normal');
            pdf.setFontSize(10);
            pdf.text(
                `${data.personal.email} | ${data.personal.phone} | ${data.personal.location}`,
                margin,
                y
            );
            y += 10;

            // ---------- SUMMARY ----------
            sectionTitle(pdf, 'PROFESSIONAL SUMMARY', margin, y);
            y += 6;

            y = addParagraph(pdf, data.summary, margin, y, 180, 4);
            y += 6;

            // ---------- WORK EXPERIENCE ----------
            sectionTitle(pdf, 'WORK EXPERIENCE', margin, y);
            y += 8;

            data.workExperience.forEach(job => {
                checkPageBreak(pdf, y);

                // Line 1
                pdf.setFont('times', 'bold');
                pdf.setFontSize(11);
                pdf.text(job.company, margin, y);
                pdf.text(
                    `${job.startDate} - ${job.endDate}`,
                    right,
                    y,
                    { align: 'right' }
                );
                y += 5;

                // Line 2
                pdf.setFont('times', 'normal');
                pdf.text(job.position, margin, y);
                pdf.text(job.location, right, y, { align: 'right' });
                y += 5;

                // Responsibilities
                job.responsibilities.forEach(r => {
                    checkPageBreak(pdf, y);
                    pdf.text(`• ${r}`, margin + 3, y);
                    y += 4;
                });

                y += 6; // space between jobs
            });

            // ---------- EDUCATION ----------
            sectionTitle(pdf, 'EDUCATION', margin, y);
            y += 6;

            data.education.forEach(edu => {
                checkPageBreak(pdf, y);
                pdf.setFont('times', 'bold');
                pdf.text(edu.institution, margin, y);
                y += 4;

                pdf.setFont('times', 'normal');
                pdf.text(`${edu.degree} — ${edu.completionDate}`, margin, y);
                y += 6;
            });

            // ---------- SKILLS ----------
            sectionTitle(pdf, 'SKILLS', margin, y);
            y += 6;

            pdf.text(
                [...data.skills.technical, ...data.skills.professional].join(', '),
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

function addParagraph(pdf, text, x, y, maxWidth, lineHeight) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
}

function checkPageBreak(pdf, y) {
    if (y > 270) {
        pdf.addPage();
        return 20;
    }
    return y;
}

// ---------------- INIT ----------------

document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});
