// ---------------- DATE FORMATTER ----------------
function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// ---------------- LOAD JSON ----------------
async function loadResumeData() {
    const response = await fetch(`resume-data.json?version=${Date.now()}`);
    const data = await response.json();
    renderResume(data);
}

// ---------------- RENDER WEB ----------------
function renderResume(data) {
    document.getElementById('resume-name').textContent = data.personal.name;
    document.getElementById('resume-title').textContent = data.personal.title;
    document.getElementById('summary-text').textContent = data.summary;
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

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', () => {
    loadResumeData();
    setupPDFDownload();
});
