class ResumeEditor {
    constructor() {
        this.isEditMode = false;
        this.currentEditElement = null;
        this.currentEditType = null;
        this.resumeData = this.loadFromLocalStorage() || this.getInitialData();
        this.dragItem = null;
        
        this.initialize();
        this.setupEventListeners();
        this.renderResume();
    }
    
    // Initial data structure
    getInitialData() {
        return {
            name: "Zain Atif",
            title: "Web Developer & IT Professional",
            email: "zainatif15403@gmail.com",
            phone: "+92 3148501486",
            location: "Karachi, Pakistan",
            
            summary: "Dynamic and dedicated professional with experience at Airmen Golf Club & Recreational Park, adept at enhancing the golfing experience. Proficient in Javascript, HTML, and CSS, I excel in problem-solving and communication, ensuring a seamless pace of play while managing multiple responsibilities effectively. Committed to delivering exceptional service and support.",
            
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
            
            languages: [
                { name: "Urdu", level: "Native (C2)" },
                { name: "English", level: "Upper Intermediate (B2)" },
                { name: "Punjabi", level: "Upper Intermediate (B2)" }
            ],
            
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
            
            personalDetails: [
                { label: "Date of Birth", value: "12/10/2004" },
                { label: "Location", value: "Karachi, Pakistan" }
            ]
        };
    }
    
    initialize() {
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Hide edit buttons initially
        document.querySelectorAll('.add-btn, .delete-btn').forEach(btn => {
            btn.classList.add('hidden');
        });
    }
    
    setupEventListeners() {
        // Edit mode toggle
        document.getElementById('editToggle').addEventListener('click', () => this.toggleEditMode());
        
        // Save/Load buttons
        document.getElementById('saveResume').addEventListener('click', () => this.saveToLocalStorage());
        document.getElementById('loadResume').addEventListener('click', () => this.loadFromLocalStorage(true));
        document.getElementById('exportPDF').addEventListener('click', () => this.exportPDF());
        document.getElementById('resetResume').addEventListener('click', () => this.resetResume());
        document.getElementById('printResume').addEventListener('click', () => window.print());
        
        // Add buttons
        document.querySelectorAll('[data-add]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAdd(e));
        });
        
        // Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-delete]')) {
                this.handleDelete(e.target.closest('[data-delete]'));
            }
        });
        
        // Edit click handlers
        document.addEventListener('click', (e) => {
            if (!this.isEditMode) return;
            
            const editable = e.target.closest('.editable, .editable-section, .editable-multi, .editable-list-item');
            if (editable) {
                e.preventDefault();
                this.openEditModal(editable);
            }
        });
        
        // Modal handlers
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('modalClose').addEventListener('click', () => this.closeEditModal());
        
        // Close modal on background click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeEditModal();
        });
        
        // Download PDF
        document.getElementById('generatePDF').addEventListener('click', () => this.exportPDF());
        
        // Import/Export data
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        
        // Drag and drop for lists
        this.setupDragAndDrop();
    }
    
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode', this.isEditMode);
        
        const editBtn = document.getElementById('editToggle');
        const adminActions = document.getElementById('adminActions');
        
        if (this.isEditMode) {
            editBtn.innerHTML = '<i class="fas fa-times"></i> Exit Edit Mode';
            editBtn.style.background = 'var(--danger-color)';
            adminActions.classList.remove('hidden');
            
            // Show all edit controls
            document.querySelectorAll('.add-btn, .delete-btn').forEach(btn => {
                btn.classList.remove('hidden');
            });
            
            this.showMessage('Edit mode enabled. Click any text to edit.', 'success');
        } else {
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Resume';
            editBtn.style.background = 'var(--secondary-color)';
            adminActions.classList.add('hidden');
            
            // Hide edit controls
            document.querySelectorAll('.add-btn, .delete-btn').forEach(btn => {
                btn.classList.add('hidden');
            });
            
            this.showMessage('Edit mode disabled. Changes saved automatically.', 'success');
            this.saveToLocalStorage();
        }
    }
    
    openEditModal(element) {
        this.currentEditElement = element;
        const modal = document.getElementById('editModal');
        const textarea = document.getElementById('editTextarea');
        
        // Determine edit type
        if (element.classList.contains('editable-list-item')) {
            this.currentEditType = 'list-item';
            textarea.value = element.textContent;
        } else if (element.classList.contains('editable-multi')) {
            this.currentEditType = 'multi';
            textarea.value = element.textContent;
        } else if (element.classList.contains('editable-section')) {
            this.currentEditType = 'section';
            textarea.value = element.textContent.replace(' ✎', '');
        } else {
            this.currentEditType = 'simple';
            textarea.value = element.textContent;
        }
        
        modal.classList.add('show');
        textarea.focus();
    }
    
    saveEdit() {
        if (!this.currentEditElement) return;
        
        const newValue = document.getElementById('editTextarea').value.trim();
        
        if (newValue) {
            this.currentEditElement.textContent = newValue;
            
            // Update data structure
            this.updateDataFromElement(this.currentEditElement, newValue);
            
            this.showMessage('Content updated successfully.', 'success');
        }
        
        this.closeEditModal();
        this.saveToLocalStorage();
    }
    
    updateDataFromElement(element, value) {
        const field = element.dataset.field;
        if (!field) return;
        
        // Update the appropriate data field
        if (field === 'name') this.resumeData.name = value;
        else if (field === 'title') this.resumeData.title = value;
        else if (field === 'email') this.resumeData.email = value;
        else if (field === 'phone') this.resumeData.phone = value;
        else if (field === 'location') this.resumeData.location = value;
        else if (field === 'summary') this.resumeData.summary = value;
        
        // Handle indexed fields
        const match = field.match(/(\w+)-(\d+)/);
        if (match) {
            const [_, type, index] = match;
            const idx = parseInt(index);
            
            switch(type) {
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
                case 'language':
                    if (this.resumeData.languages[idx]) {
                        this.resumeData.languages[idx].name = value;
                    }
                    break;
                case 'degree':
                    if (this.resumeData.education[idx]) {
                        this.resumeData.education[idx].degree = value;
                    }
                    break;
                // Add more cases as needed
            }
        }
    }
    
    closeEditModal() {
        document.getElementById('editModal').classList.remove('show');
        document.getElementById('editTextarea').value = '';
        this.currentEditElement = null;
        this.currentEditType = null;
    }
    
    handleAdd(event) {
        const type = event.target.closest('[data-add]').dataset.add;
        
        switch(type) {
            case 'experience':
                this.addExperience();
                break;
            case 'skill':
                this.addSkillCategory();
                break;
            case 'language':
                this.addLanguage();
                break;
            case 'education':
                this.addEducation();
                break;
            case 'personal':
                this.addPersonalDetail();
                break;
        }
        
        this.saveToLocalStorage();
        this.showMessage(`New ${type} added.`, 'success');
    }
    
    addExperience() {
        const template = document.getElementById('jobTemplate');
        const clone = template.content.cloneNode(true);
        const experienceList = document.getElementById('experienceList');
        
        // Set new index
        const newIndex = this.resumeData.experience.length;
        clone.querySelector('.editable-group').dataset.index = newIndex;
        
        // Update all data-field attributes
        clone.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field.replace('-', `-${newIndex}`);
            el.dataset.field = field;
        });
        
        // Update delete button
        const deleteBtn = clone.querySelector('[data-delete]');
        deleteBtn.dataset.delete = `experience-${newIndex}`;
        
        experienceList.appendChild(clone);
        
        // Add to data structure
        this.resumeData.experience.push({
            company: "New Company",
            position: "Position",
            location: "Location",
            startDate: "MM/YYYY",
            endDate: "MM/YYYY",
            responsibilities: ["Responsibility 1"]
        });
        
        // Hide empty state
        document.getElementById('emptyExperience').classList.add('hidden');
    }
    
    addSkillCategory() {
        const template = document.getElementById('skillCategoryTemplate');
        const clone = template.content.cloneNode(true);
        const skillsGrid = document.querySelector('.skills-grid');
        
        // Set new index
        const newIndex = this.resumeData.skills.length;
        clone.querySelector('.editable-group').dataset.index = newIndex;
        
        // Update all data-field attributes
        clone.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field.replace('-', `-${newIndex}`);
            el.dataset.field = field;
        });
        
        // Update delete button
        const deleteBtn = clone.querySelector('[data-delete]');
        deleteBtn.dataset.delete = `category-${newIndex}`;
        
        skillsGrid.appendChild(clone);
        
        // Add to data structure
        this.resumeData.skills.push({
            category: "New Category",
            items: ["New Skill"]
        });
    }
    
    addLanguage() {
        const template = document.getElementById('languageTemplate');
        const clone = template.content.cloneNode(true);
        const languageList = document.getElementById('languageList');
        
        // Set new index
        const newIndex = this.resumeData.languages.length;
        clone.querySelector('.editable-group').dataset.index = newIndex;
        
        // Update all data-field attributes
        clone.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field.replace('-', `-${newIndex}`);
            el.dataset.field = field;
        });
        
        // Update delete button
        const deleteBtn = clone.querySelector('[data-delete]');
        deleteBtn.dataset.delete = `language-${newIndex}`;
        
        languageList.appendChild(clone);
        
        // Add to data structure
        this.resumeData.languages.push({
            name: "Language",
            level: "Proficiency Level"
        });
    }
    
    addEducation() {
        const template = document.getElementById('educationTemplate');
        const clone = template.content.cloneNode(true);
        const educationList = document.getElementById('educationList');
        
        // Set new index
        const newIndex = this.resumeData.education.length;
        clone.querySelector('.editable-group').dataset.index = newIndex;
        
        // Update all data-field attributes
        clone.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field.replace('-', `-${newIndex}`);
            el.dataset.field = field;
        });
        
        // Update delete button
        const deleteBtn = clone.querySelector('[data-delete]');
        deleteBtn.dataset.delete = `education-${newIndex}`;
        
        educationList.appendChild(clone);
        
        // Add to data structure
        this.resumeData.education.push({
            degree: "Degree/Certificate",
            institution: "Institution",
            date: "Date/Year"
        });
    }
    
    addPersonalDetail() {
        const template = document.getElementById('personalDetailTemplate');
        const clone = template.content.cloneNode(true);
        const personalDetails = document.querySelector('.personal-details');
        
        // Set new index
        const newIndex = this.resumeData.personalDetails.length;
        clone.querySelector('.editable-group').dataset.index = newIndex;
        
        // Update all data-field attributes
        clone.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field.replace('-', `-${newIndex}`);
            el.dataset.field = field;
        });
        
        // Update delete button
        const deleteBtn = clone.querySelector('[data-delete]');
        deleteBtn.dataset.delete = `personal-${newIndex}`;
        
        personalDetails.appendChild(clone);
        
        // Add to data structure
        this.resumeData.personalDetails.push({
            label: "Label",
            value: "Value"
        });
    }
    
    handleDelete(button) {
        const deleteType = button.dataset.delete;
        const [type, index] = deleteType.split('-');
        const idx = parseInt(index);
        
        if (confirm('Are you sure you want to delete this item?')) {
            switch(type) {
                case 'experience':
                    this.resumeData.experience.splice(idx, 1);
                    document.querySelector(`.experience-item[data-index="${idx}"]`).remove();
                    
                    // Show empty state if no experience
                    if (this.resumeData.experience.length === 0) {
                        document.getElementById('emptyExperience').classList.remove('hidden');
                    }
                    break;
                    
                case 'category':
                    this.resumeData.skills.splice(idx, 1);
                    document.querySelector(`.skill-category[data-index="${idx}"]`).remove();
                    break;
                    
                case 'language':
                    this.resumeData.languages.splice(idx, 1);
                    document.querySelector(`.language-item[data-index="${idx}"]`).remove();
                    break;
                    
                case 'education':
                    this.resumeData.education.splice(idx, 1);
                    document.querySelector(`.education-item[data-index="${idx}"]`).remove();
                    break;
                    
                case 'personal':
                    this.resumeData.personalDetails.splice(idx, 1);
                    document.querySelector(`.personal-detail[data-index="${idx}"]`).remove();
                    break;
            }
            
            this.saveToLocalStorage();
            this.showMessage('Item deleted.', 'success');
        }
    }
    
    setupDragAndDrop() {
        const lists = document.querySelectorAll('.editable-list');
        
        lists.forEach(list => {
            list.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('editable-list-item')) {
                    e.target.classList.add('dragging');
                    this.dragItem = e.target;
                }
            });
            
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(list, e.clientY);
                const draggable = this.dragItem;
                
                if (afterElement == null) {
                    list.appendChild(draggable);
                } else {
                    list.insertBefore(draggable, afterElement);
                }
            });
            
            list.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.dragItem = null;
                this.saveToLocalStorage();
            });
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.editable-list-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
            this.showMessage('Resume saved to browser storage.', 'success');
            return true;
        } catch (e) {
            this.showMessage('Error saving resume: ' + e.message, 'danger');
            return false;
        }
    }
    
    loadFromLocalStorage(showMessage = false) {
        try {
            const saved = localStorage.getItem('resumeData');
            if (saved) {
                this.resumeData = JSON.parse(saved);
                if (showMessage) {
                    this.showMessage('Resume loaded from browser storage.', 'success');
                    this.renderResume();
                }
                return this.resumeData;
            }
        } catch (e) {
            if (showMessage) {
                this.showMessage('Error loading resume: ' + e.message, 'danger');
            }
        }
        return null;
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.resumeData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `resume-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showMessage('Resume data exported as JSON file.', 'success');
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.resumeData = data;
                this.renderResume();
                this.saveToLocalStorage();
                this.showMessage('Resume data imported successfully.', 'success');
            } catch (error) {
                this.showMessage('Error importing file: Invalid JSON format.', 'danger');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    exportPDF() {
        // Temporarily exit edit mode for clean PDF
        const wasEditMode = this.isEditMode;
        if (wasEditMode) this.toggleEditMode();
        
        // Use browser's print to PDF
        window.print();
        
        this.showMessage('Use "Print to PDF" in your browser to save as PDF.', 'success');
    }
    
    resetResume() {
        if (confirm('Are you sure you want to reset to the default resume? This cannot be undone.')) {
            localStorage.removeItem('resumeData');
            this.resumeData = this.getInitialData();
            this.renderResume();
            this.showMessage('Resume reset to default.', 'success');
        }
    }
    
    renderResume() {
        // Update basic fields
        document.querySelector('[data-field="name"]').textContent = this.resumeData.name;
        document.querySelector('[data-field="title"]').textContent = this.resumeData.title;
        document.querySelector('[data-field="email"]').textContent = this.resumeData.email;
        document.querySelector('[data-field="phone"]').textContent = this.resumeData.phone;
        document.querySelector('[data-field="location"]').textContent = this.resumeData.location;
        document.querySelector('[data-field="footer-name"]').textContent = this.resumeData.name;
        document.querySelector('[data-field="summary"]').textContent = this.resumeData.summary;
        
        // Note: Full rendering of dynamic sections would require more complex logic
        // For now, we rely on the HTML structure and update via edit mode
    }
    
    showMessage(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = 'status-message show';
        
        // Set color based on type
        if (type === 'danger') {
            statusEl.style.borderLeftColor = 'var(--danger-color)';
        } else if (type === 'warning') {
            statusEl.style.borderLeftColor = 'var(--warning-color)';
        } else {
            statusEl.style.borderLeftColor = 'var(--success-color)';
        }
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }
}

// Initialize the resume editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.resumeEditor = new ResumeEditor();
});
