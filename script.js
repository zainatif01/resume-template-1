// Simple JavaScript for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Current year in footer
    const footerYear = document.querySelector('.footer p');
    if (footerYear && footerYear.textContent.includes('2024')) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2024', currentYear);
    }
    
    // Print functionality
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Resume';
    printBtn.className = 'print-btn';
    printBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    printBtn.onclick = () => window.print();
    document.body.appendChild(printBtn);
    
    // Hide print button when printing
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .print-btn { display: none !important; }
        }
    `;
    document.head.appendChild(style);
    
    // Smooth hover effects
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add subtle animation to job items
    const jobItems = document.querySelectorAll('.experience-item');
    jobItems.forEach(item => {
        item.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = 'none';
        });
    });
});
