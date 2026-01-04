class JSONResumeEditor {
    constructor() {
        this.resumeData = null;
        this.currentFile = 'resume-data.json';
        this.isEditing = false;
        this.debounceTimer = null;
        
        this.init();
    }
    
    async init() {
        // Set current year
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Load resume data
        await this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render resume
        this.renderResume();
        
        // Start auto-save
        this.startAutoSave();
    }
    
    async loadData() {
        try {
            // Try to load from localStorage first
            const saved = localStorage.getItem('resumeData');
            if (saved) {
                this.resumeData = JSON.parse(saved);
                console.log('Loaded from localStorage');
                return;
            }
            
            // Try to load from JSON file
            const response = await fetch(this.currentFile);
            if (response.ok) {
                this.resumeData = await response.json();
                console.log('Loaded from JSON file');
                this.saveToLocalStorage();
            } else {
                // Create default data
                this.resumeData = this.createDefaultData();
                console.log('Created default data');
                this.saveToFile(); // Create initial file
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.resumeData = this.createDefaultData();
        }
    }
    
    createDefaultData() {
        return {
            name: "Zain Atif",
            title: "Web Developer & IT Professional",
            email: "zainatif15403@gmail.com",
            phone: "+92 3148501486",
            location: "Karachi, Pakistan",
            footerName: "Zain Atif",
            
            summaryTitle: "Professional Summary",
            summary: [
                "Dynamic and dedicated professional with experience at Airmen Golf Club & Recreational Park, adept at enhancing the golfing experience.",
                "Proficient in Javascript, HTML, and CSS, I excel in problem-solving and communication, ensuring a seamless pace of play while managing multiple responsibilities effectively.",
                "Committed to delivering exceptional service and support."
            ],
            
            experienceTitle: "Work Experience",
            experience: [
                {
                    company: "Airmen Golf Club & Recreational Park",
                    position: "Caddie",
                    location: "Korangi Creek, Karachi",
                    startDate: "12/2020",
                    endDate: "11/2021",
                    responsibilities: [
                        "Maintained smooth pace of play for golfers on course",
                        "Carried two bags of clubs for full 18-hole rounds of golf"
                    ]
                }
            ],
            
            skillsTitle: "Skills",
            skills: [
                {
                    category: "Technical Skills",
                    items: ["JavaScript", "HTML5", "CSS3", "Databases"]
                },
                {
                    category: "Professional Skills",
                    items: ["Problem Solving", "Communication", "Customer Service", "Time Management"]
                }
            ],
            
            languagesTitle: "Languages",
            languages: [
                { name: "Urdu", level: "Native (C2)" },
                { name: "English", level: "Upper Intermediate (B2)" },
                { name: "Punjabi", level: "Upper Intermediate (B2)" }
            ],
            
            educationTitle: "Education",
            education: [
                {
                    degree: "HSSC: Computer Science",
                    institution: "FDC Faisal, Karachi",
                    date: "Expected: 06/2025"
                },
                {
                    degree: "SSC: General Science",
                    institution: "FDC Faisal, Karachi",
                    date: "10/2022"
                }
            ],
            
            personalTitle: "Personal Details",
            personalDetails: [
                { label: "Date of Birth", value: "12/10/2004" },
                { label: "Location", value: "Karachi, Pakistan" }
            ]
        };
    }
    
    setupEventListeners() {
        // JSON file controls
        document.getElementById('saveToFile').addEventListener('click', () => this.saveToFile());
        document.getElementById('jsonFileInput').addEventListener('change', (e) => this.loadFromFile(e));
        document.getElementById('newJson').addEventListener('click', () => this.createNewResume());
        document.getElementById('editJson').addEventListener('click', () => this.openJsonEditor());
        document.getElementById('closeJsonEditor').addEventListener('click', () => this.closeJsonEditor());
        document.getElementById('applyJson').addEventListener('click', () => this.applyJsonChanges());
        document.getElementById('formatJson').addEventListener('click', () => this.formatJson());
        document.getElementById('cancelJson').addEventListener('click', () => this.closeJsonEditor());
        
        // PDF export
        document.getElementById('exportPdf').addEventListener('click', () => window.print());
        
        // Global click handler for editing
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Global input handler for editing
        document.addEventListener('input', (e) => this.handleInput(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveToFile();
            }
        });
    }
    
    handleClick(e) {
        // Handle add buttons
        if (e.target.closest('[data-add]')) {
            const btn = e.target.closest('[data-add]');
            const type = btn.dataset.add;
            this.addItem(type);
            return;
        }
        
        // Handle delete buttons
        if (e.target.closest('[data-delete]')) {
            const btn = e.target.closest('[data-delete]');
            const [type, index] = btn.dataset.delete.split('-');
            this.deleteItem(type, parseInt(index));
            return;
        }
        
        // Make elements editable on click
        if (e.target.classList.contains('editable') && !this.isEditing) {
            this.startEditing(e.target);
        }
    }
    
    handleInput(e) {
        if (e.target.classList.contains('editable') && this.isEditing) {
            this.updateDataFromElement(e.target);
        }
    }
    
    startEditing(element) {
        this.isEditing = true;
        element.contentEditable = true;
        element.focus();
        
        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Handle end of editing
        const handleEnd = () => {
            element.contentEditable = false;
            this.isEditing = false;
            this.updateDataFromElement(element);
            element.removeEventListener('blur', handleEnd);
            element.removeEventListener('keydown', handleKey);
        };
        
        // Handle Enter key to finish editing
        const handleKey = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEnd();
            }
            if (e.key === 'Escape') {
                element.textContent = this.getOriginalValue(element);
                handleEnd();
            }
        };
        
        element.addEventListener('blur', handleEnd);
        element.addEventListener('keydown', handleKey);
    }
    
    getOriginalValue(element) {
        // Get the original value from data structure
        const field = element.dataset.field;
        if (!field) return element.textContent;
        
        // This would need to be implemented based on your data structure
        // For simplicity, return current text
        return element.textContent;
    }
    
    updateDataFromElement(element) {
        const field = element.dataset.field;
        const value = element.textContent.trim();
        
        if (!field || !value) return;
        
        // Update data structure based on field
        if (field === 'name') this.resumeData.name = value;
        else if (field === 'title') this.resumeData.title = value;
        else if (field === 'email') this.resumeData.email = value;
        else if (field === 'phone') this.resumeData.phone = value;
        else if (field === 'location') this.resumeData.location = value;
        else if (field === 'footerName') this.resumeData.footerName = value;
        else if (field === 'summaryTitle') this.resumeData.summaryTitle = value;
        else if (field === 'experienceTitle') this.resumeData.experienceTitle = value;
        else if (field === 'skillsTitle') this.resumeData.skillsTitle = value;
        else if (field === 'languagesTitle') this.resumeData.languagesTitle = value;
        else if (field === 'educationTitle') this.resumeData.educationTitle = value;
        else if (field === 'personalTitle') this.resumeData.personalTitle = value;
        
        // Handle indexed fields
        const match = field.match(/(\w+)-(\d+)/);
        if (match) {
            const [_, type, index] = match;
            const idx = parseInt(index);
            
            switch(type) {
                case 'summaryParagraph':
                    if (this.resumeData.summary[idx]) {
                        this.resumeData.summary[idx] = value;
                    }
                    break;
                case 'company':
                    if (this.resumeData.experience[idx]) {
                        this.resumeData.experience[idx].company = value;
                    }
                    break;
                case 'position':
                    if (this.resumeData.experience[idx]) {
                        this.resumeData.experience[idx].position = value;
                    }
                    break;
                // Add more cases as needed
            }
        }
        
        // Trigger auto-save
        this.triggerAutoSave();
    }
    
    addItem(type) {
        switch(type) {
            case 'summaryParagraph':
                this.resumeData.summary.push("New summary paragraph");
                break;
            case 'experience':
                this.resumeData.experience.push({
                    company: "New Company",
                    position: "Position",
                    location: "Location",
                    startDate: "MM/YYYY",
                    endDate: "MM/YYYY",
                    responsibilities: ["Responsibility 1"]
                });
                break;
            case 'skillCategory':
                this.resumeData.skills.push({
                    category: "New Category",
                    items: ["New Skill"]
                });
                break;
            case 'language':
                this.resumeData.languages.push({
                    name: "Language",
                    level: "Level"
                });
                break;
            case 'education':
                this.resumeData.education.push({
                    degree: "Degree",
                    institution: "Institution",
                    date: "Date"
                });
                break;
            case 'personal':
                this.resumeData.personalDetails.push({
                    label: "Label",
                    value: "Value"
                });
                break;
        }
        
        this.renderResume();
        this.triggerAutoSave();
    }
    
    deleteItem(type, index) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        switch(type) {
            case 'experience':
                this.resumeData.experience.splice(index, 1);
                break;
            case 'category':
                this.resumeData.skills.splice(index, 1);
                break;
            case 'language':
                this.resumeData.languages.splice(index, 1);
                break;
            case 'education':
                this.resumeData.education.splice(index, 1);
                break;
            case 'personal':
                this.resumeData.personalDetails.splice(index, 1);
                break;
        }
        
        this.renderResume();
        this.triggerAutoSave();
    }
    
    renderResume() {
        const container = document.getElementById('resumeContainer');
        const template = document.getElementById('resumeTemplate');
        
        // Clear and recreate resume
        container.innerHTML = '';
        const resume = template.content.cloneNode(true);
        container.appendChild(resume);
        
        // Populate data
        this.populateResume();
        
        // Reattach event listeners to new elements
        this.reattachEventListeners();
    }
    
    populateResume() {
        // Basic info
        document.querySelector('[data-field="name"]').textContent = this.resumeData.name;
        document.querySelector('[data-field="title"]').textContent = this.resumeData.title;
        document.querySelector('[data-field="email"]').textContent = this.resumeData.email;
        document.querySelector('[data-field="phone"]').textContent = this.resumeData.phone;
        document.querySelector('[data-field="location"]').textContent = this.resumeData.location;
        document.querySelector('[data-field="footerName"]').textContent = this.resumeData.footerName;
        
        // Section titles
        document.querySelector('[data-field="summaryTitle"]').textContent = this.resumeData.summaryTitle;
        document.querySelector('[data-field="experienceTitle"]').textContent = this.resumeData.experienceTitle;
        document.querySelector('[data-field="skillsTitle"]').textContent = this.resumeData.skillsTitle;
        document.querySelector('[data-field="languagesTitle"]').textContent = this.resumeData.languagesTitle;
        document.querySelector('[data-field="educationTitle"]').textContent = this.resumeData.educationTitle;
        document.querySelector('[data-field="personalTitle"]').textContent = this.resumeData.personalTitle;
        
        // Summary
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = '';
        this.resumeData.summary.forEach((paragraph, index) => {
            const p = document.createElement('p');
            p.className = 'editable summary-paragraph';
            p.dataset.field = `summaryParagraph-${index}`;
            p.textContent = paragraph;
            summaryContent.appendChild(p);
        });
        
        // Experience
        const experienceList = document.getElementById('experienceList');
        experienceList.innerHTML = '';
        this.resumeData.experience.forEach((job, index) => {
            const template = document.getElementById('experienceItemTemplate');
            const clone = template.content.cloneNode(true);
            
            // Replace placeholders
            const html = clone.querySelector('.experience-item').outerHTML
                .replace(/{{index}}/g, index);
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const jobElement = temp.firstChild;
            
            // Populate job data
            jobElement.querySelector('[data-field="company-' + index + '"]').textContent = job.company;
            jobElement.querySelector('[data-field="position-' + index + '"]').textContent = job.position;
            jobElement.querySelector('[data-field="jobLocation-' + index + '"]').textContent = job.location;
            jobElement.querySelector('[data-field="startDate-' + index + '"]').textContent = job.startDate;
            jobElement.querySelector('[data-field="endDate-' + index + '"]').textContent = job.endDate;
            
            // Populate responsibilities
            const responsibilitiesList = jobElement.querySelector('.job-responsibilities');
            responsibilitiesList.innerHTML = '';
            job.responsibilities.forEach((resp, respIndex) => {
                const li = document.createElement('li');
                li.className = 'editable responsibility-item';
                li.dataset.item = respIndex;
                li.textContent = resp;
                responsibilitiesList.appendChild(li);
            });
            
            experienceList.appendChild(jobElement);
        });
        
        // Skills
        const skillsGrid = document.getElementById('skillsGrid');
        skillsGrid.innerHTML = '';
        this.resumeData.skills.forEach((category, index) => {
            const template = document.getElementById('skillCategoryTemplate');
            const clone = template.content.cloneNode(true);
            
            // Replace placeholders
            const html = clone.querySelector('.skill-category').outerHTML
                .replace(/{{index}}/g, index);
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const categoryElement = temp.firstChild;
            
            // Populate category data
            categoryElement.querySelector('[data-field="category-' + index + '"]').textContent = category.category;
            
            // Populate skills
            const skillList = categoryElement.querySelector('.skill-list');
            skillList.innerHTML = '';
            category.items.forEach((skill, skillIndex) => {
                const span = document.createElement('span');
                span.className = 'skill-tag editable';
                span.dataset.skill = skillIndex;
                span.textContent = skill;
                skillList.appendChild(span);
            });
            
            skillsGrid.appendChild(categoryElement);
        });
        
        // Languages
        const languageList = document.getElementById('languageList');
        languageList.innerHTML = '';
        this.resumeData.languages.forEach((lang, index) => {
            const template = document.getElementById('languageItemTemplate');
            const clone = template.content.cloneNode(true);
            
            // Replace placeholders
            const html = clone.querySelector('.language-item').outerHTML
                .replace(/{{index}}/g, index);
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const langElement = temp.firstChild;
            
            // Populate language data
            langElement.querySelector('[data-field="language-' + index + '"]').textContent = lang.name;
            langElement.querySelector('[data-field="level-' + index + '"]').textContent = lang.level;
            
            languageList.appendChild(langElement);
        });
        
        // Education
        const educationList = document.getElementById('educationList');
        educationList.innerHTML = '';
        this.resumeData.education.forEach((edu, index) => {
            const template = document.getElementById('educationItemTemplate');
            const clone = template.content.cloneNode(true);
            
            // Replace placeholders
            const html = clone.querySelector('.education-item').outerHTML
                .replace(/{{index}}/g, index);
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const eduElement = temp.firstChild;
            
            // Populate education data
            eduElement.querySelector('[data-field="degree-' + index + '"]').textContent = edu.degree;
            eduElement.querySelector('[data-field="institution-' + index + '"]').textContent = edu.institution;
            eduElement.querySelector('[data-field="educationDate-' + index + '"]').textContent = edu.date;
            
            educationList.appendChild(eduElement);
        });
        
        // Personal Details
        const personalDetails = document.getElementById('personalDetails');
        personalDetails.innerHTML = '';
        this.resumeData.personalDetails.forEach((detail, index) => {
            const template = document.getElementById('personalDetailTemplate');
            const clone = template.content.cloneNode(true);
            
            // Replace placeholders
            const html = clone.querySelector('.personal-detail').outerHTML
                .replace(/{{index}}/g, index);
            
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const detailElement = temp.firstChild;
            
            // Populate personal detail data
            detailElement.querySelector('[data-field="detailLabel-' + index + '"]').textContent = detail.label + ':';
            detailElement.querySelector('[data-field="detailValue-' + index + '"]').textContent = detail.value;
            
            personalDetails.appendChild(detailElement);
        });
    }
    
    reattachEventListeners() {
        // Reattach event listeners to dynamically created elements
        document.querySelectorAll('[data-add]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = btn.dataset.add;
                this.addItem(type);
            });
        });
        
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [type, index] = btn.dataset.delete.split('-');
                this.deleteItem(type, parseInt(index));
            });
        });
    }
    
    startAutoSave() {
        // Auto-save to localStorage every 30 seconds
        setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);
    }
    
    triggerAutoSave() {
        // Debounce auto-save to prevent too frequent saves
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.saveToLocalStorage();
            console.log('Auto-saved to localStorage');
        }, 1000);
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('resumeData', JSON.stringify(this.resumeData, null, 2));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    saveToFile() {
        try {
            const dataStr = JSON.stringify(this.resumeData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', this.currentFile);
            link.click();
            
            // Update status
            document.getElementById('jsonStatus').textContent = `${this.currentFile} (saved)`;
            
            console.log('Saved to file:', this.currentFile);
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Error saving file. Please try again.');
        }
    }
    
    async loadFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            this.resumeData = JSON.parse(text);
            this.currentFile = file.name;
            
            // Update status
            document.getElementById('jsonStatus').textContent = file.name;
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Re-render resume
            this.renderResume();
            
            console.log('Loaded from file:', file.name);
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file. Please make sure it is a valid JSON file.');
        }
        
        // Reset file input
        event.target.value = '';
    }
    
    createNewResume() {
        if (confirm('Create a new empty resume? Your current data will be lost.')) {
            this.resumeData = this.createDefaultData();
            this.currentFile = 'new-resume.json';
            
            // Update status
            document.getElementById('jsonStatus').textContent = this.currentFile;
            
            // Re-render resume
            this.renderResume();
            
            // Save to localStorage
            this.saveToLocalStorage();
        }
    }
    
    openJsonEditor() {
        const editor = document.getElementById('jsonEditor');
        const textarea = document.getElementById('jsonTextarea');
        
        textarea.value = JSON.stringify(this.resumeData, null, 2);
        editor.classList.remove('hidden');
        
        // Focus and select all text
        textarea.focus();
        textarea.select();
    }
    
    closeJsonEditor() {
        document.getElementById('jsonEditor').classList.add('hidden');
    }
    
    applyJsonChanges() {
        try {
            const textarea = document.getElementById('jsonTextarea');
            const newData = JSON.parse(textarea.value);
            
            this.resumeData = newData;
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Re-render resume
            this.renderResume();
            
            // Close editor
            this.closeJsonEditor();
            
            console.log('Applied JSON changes');
        } catch (error) {
            console.error('Invalid JSON:', error);
            alert('Invalid JSON format. Please check your syntax.');
        }
    }
    
    formatJson() {
        const textarea = document.getElementById('jsonTextarea');
        try {
            const parsed = JSON.parse(textarea.value);
            textarea.value = JSON.stringify(parsed, null, 2);
        } catch (error) {
            console.error('Invalid JSON:', error);
            alert('Cannot format invalid JSON.');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.resumeEditor = new JSONResumeEditor();
});
