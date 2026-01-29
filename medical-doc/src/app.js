// Medical Documentation Application
class MedicalApp {
    constructor() {
        this.currentSection = 'patient-section';
        this.selectedPatientId = null;
        this.authToken = null;
    }

    async init() {
        try {
            // Initialize auth service first
            await authService.init();
            
            // Check authentication
            if (!authService.requireAuth()) {
                return; // Will redirect to login
            }

            // Store auth token for API calls
            this.authToken = authService.getAuthToken();

            // Display current user
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                document.getElementById('current-user').textContent = `Welcome, ${currentUser.username}`;
            }

            await medicalDB.init();
            this.setupEventListeners();
            await this.loadPatients();
            this.showNotification('Application loaded successfully', false);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showNotification('Failed to initialize application', true);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            authService.logout();
        });

        // Patient form
        document.getElementById('patient-form').addEventListener('submit', (e) => this.handlePatientSubmit(e));
        document.getElementById('clear-patient').addEventListener('click', () => this.clearPatientForm());

        // Case history form
        document.getElementById('history-form').addEventListener('submit', (e) => this.handleHistorySubmit(e));
        document.getElementById('clear-history').addEventListener('click', () => this.clearHistoryForm());
        document.getElementById('history-patient-select').addEventListener('change', (e) => {
            this.selectedPatientId = parseInt(e.target.value);
            this.loadCaseHistories();
        });

        // Examination report form
        document.getElementById('report-form').addEventListener('submit', (e) => this.handleReportSubmit(e));
        document.getElementById('clear-report').addEventListener('click', () => this.clearReportForm());
        document.getElementById('report-patient-select').addEventListener('change', (e) => {
            this.selectedPatientId = parseInt(e.target.value);
            this.loadExaminationReports();
        });

        // Consolidated view
        document.getElementById('view-patient-select').addEventListener('change', (e) => {
            this.loadConsolidatedView(parseInt(e.target.value));
        });
    }

    handleNavigation(e) {
        const targetSection = e.target.id.replace('nav-', '') + '-section';
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');

        this.currentSection = targetSection;
    }

    async handlePatientSubmit(e) {
        e.preventDefault();

        const patientData = {
            name: document.getElementById('patient-name').value.trim(),
            age: parseInt(document.getElementById('patient-age').value),
            gender: document.getElementById('patient-gender').value,
            dob: document.getElementById('patient-dob').value,
            bloodGroup: document.getElementById('patient-blood-group').value.trim(),
            contact: document.getElementById('patient-contact').value.trim(),
            email: document.getElementById('patient-email').value.trim(),
            address: document.getElementById('patient-address').value.trim(),
            createdAt: new Date().toISOString()
        };

        try {
            await medicalDB.addPatient(patientData);
            this.showNotification('Patient saved successfully', false);
            this.clearPatientForm();
            await this.loadPatients();
        } catch (error) {
            console.error('Failed to save patient:', error);
            this.showNotification('Failed to save patient', true);
        }
    }

    async handleHistorySubmit(e) {
        e.preventDefault();

        const patientId = parseInt(document.getElementById('history-patient-select').value);
        if (!patientId) {
            this.showNotification('Please select a patient', true);
            return;
        }

        const historyData = {
            patientId: patientId,
            date: document.getElementById('history-date').value,
            complaint: document.getElementById('history-complaint').value.trim(),
            symptoms: document.getElementById('history-symptoms').value.trim(),
            diagnosis: document.getElementById('history-diagnosis').value.trim(),
            treatment: document.getElementById('history-treatment').value.trim(),
            notes: document.getElementById('history-notes').value.trim(),
            createdAt: new Date().toISOString()
        };

        try {
            await medicalDB.addCaseHistory(historyData);
            this.showNotification('Case history saved successfully', false);
            this.clearHistoryForm();
            await this.loadCaseHistories();
        } catch (error) {
            console.error('Failed to save case history:', error);
            this.showNotification('Failed to save case history', true);
        }
    }

    async handleReportSubmit(e) {
        e.preventDefault();

        const patientId = parseInt(document.getElementById('report-patient-select').value);
        if (!patientId) {
            this.showNotification('Please select a patient', true);
            return;
        }

        const fileInput = document.getElementById('report-file');
        let fileData = null;
        let fileName = null;
        let fileType = null;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileName = file.name;
            fileType = file.type;
            
            // Convert file to base64
            try {
                fileData = await this.fileToBase64(file);
            } catch (error) {
                console.error('Failed to process file:', error);
                this.showNotification('Failed to process file', true);
                return;
            }
        }

        const reportData = {
            patientId: patientId,
            date: document.getElementById('report-date').value,
            type: document.getElementById('report-type').value,
            title: document.getElementById('report-title').value.trim(),
            findings: document.getElementById('report-findings').value.trim(),
            fileName: fileName,
            fileType: fileType,
            fileData: fileData,
            createdAt: new Date().toISOString()
        };

        try {
            await medicalDB.addExaminationReport(reportData);
            this.showNotification('Examination report saved successfully', false);
            this.clearReportForm();
            await this.loadExaminationReports();
        } catch (error) {
            console.error('Failed to save examination report:', error);
            this.showNotification('Failed to save examination report', true);
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async loadPatients() {
        try {
            const patients = await medicalDB.getAllPatients();
            this.renderPatientCards(patients);
            this.populatePatientSelectors(patients);
        } catch (error) {
            console.error('Failed to load patients:', error);
            this.showNotification('Failed to load patients', true);
        }
    }

    renderPatientCards(patients) {
        const container = document.getElementById('patient-cards');
        
        if (patients.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No patients found. Add a new patient to get started.</p></div>';
            return;
        }

        container.innerHTML = patients.map(patient => `
            <div class="card" data-patient-id="${patient.id}">
                <div class="card-header">
                    <h4>${patient.name}</h4>
                </div>
                <div class="card-body">
                    <p><strong>Age:</strong> ${patient.age} years</p>
                    <p><strong>Gender:</strong> ${patient.gender}</p>
                    <p><strong>DOB:</strong> ${patient.dob}</p>
                    ${patient.bloodGroup ? `<p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>` : ''}
                    ${patient.contact ? `<p><strong>Contact:</strong> ${patient.contact}</p>` : ''}
                    ${patient.email ? `<p><strong>Email:</strong> ${patient.email}</p>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="app.deletePatient(${patient.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    populatePatientSelectors(patients) {
        const selectors = [
            document.getElementById('history-patient-select'),
            document.getElementById('report-patient-select'),
            document.getElementById('view-patient-select')
        ];

        selectors.forEach(selector => {
            const options = patients.map(patient => 
                `<option value="${patient.id}">${patient.name} (Age: ${patient.age})</option>`
            ).join('');
            selector.innerHTML = '<option value="">-- Select a patient --</option>' + options;
        });
    }

    async loadCaseHistories() {
        if (!this.selectedPatientId) {
            document.getElementById('history-cards').innerHTML = '<div class="empty-state"><p>Please select a patient to view case histories.</p></div>';
            return;
        }

        try {
            const histories = await medicalDB.getCaseHistoriesByPatient(this.selectedPatientId);
            this.renderCaseHistoryCards(histories);
        } catch (error) {
            console.error('Failed to load case histories:', error);
            this.showNotification('Failed to load case histories', true);
        }
    }

    renderCaseHistoryCards(histories) {
        const container = document.getElementById('history-cards');
        
        if (histories.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No case histories found for this patient.</p></div>';
            return;
        }

        container.innerHTML = histories.sort((a, b) => new Date(b.date) - new Date(a.date)).map(history => `
            <div class="card" data-history-id="${history.id}">
                <div class="card-header">
                    <h4>Date: ${history.date}</h4>
                </div>
                <div class="card-body">
                    <p><strong>Chief Complaint:</strong> ${history.complaint}</p>
                    ${history.symptoms ? `<p><strong>Symptoms:</strong> ${history.symptoms}</p>` : ''}
                    ${history.diagnosis ? `<p><strong>Diagnosis:</strong> ${history.diagnosis}</p>` : ''}
                    ${history.treatment ? `<p><strong>Treatment:</strong> ${history.treatment}</p>` : ''}
                    ${history.notes ? `<p><strong>Notes:</strong> ${history.notes}</p>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-danger btn-small" onclick="app.deleteCaseHistory(${history.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async loadExaminationReports() {
        if (!this.selectedPatientId) {
            document.getElementById('report-cards').innerHTML = '<div class="empty-state"><p>Please select a patient to view examination reports.</p></div>';
            return;
        }

        try {
            const reports = await medicalDB.getExaminationReportsByPatient(this.selectedPatientId);
            this.renderExaminationReportCards(reports);
        } catch (error) {
            console.error('Failed to load examination reports:', error);
            this.showNotification('Failed to load examination reports', true);
        }
    }

    renderExaminationReportCards(reports) {
        const container = document.getElementById('report-cards');
        
        if (reports.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No examination reports found for this patient.</p></div>';
            return;
        }

        container.innerHTML = reports.sort((a, b) => new Date(b.date) - new Date(a.date)).map(report => `
            <div class="card" data-report-id="${report.id}">
                <div class="card-header">
                    <h4>${report.title}</h4>
                </div>
                <div class="card-body">
                    <p><strong>Date:</strong> ${report.date}</p>
                    <p><strong>Type:</strong> ${report.type}</p>
                    ${report.findings ? `<p><strong>Findings:</strong> ${report.findings}</p>` : ''}
                    ${report.fileName ? `<p><strong>File:</strong> ${report.fileName}</p>` : ''}
                </div>
                <div class="card-actions">
                    ${report.fileData ? `<button class="btn btn-secondary btn-small" onclick="app.downloadReport(${report.id})">Download</button>` : ''}
                    <button class="btn btn-danger btn-small" onclick="app.deleteExaminationReport(${report.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async loadConsolidatedView(patientId) {
        const container = document.getElementById('consolidated-view');

        if (!patientId) {
            container.innerHTML = '<div class="empty-state"><p>Please select a patient to view consolidated information.</p></div>';
            return;
        }

        try {
            const patient = await medicalDB.getPatient(patientId);
            const histories = await medicalDB.getCaseHistoriesByPatient(patientId);
            const reports = await medicalDB.getExaminationReportsByPatient(patientId);

            container.innerHTML = `
                <div class="patient-profile-card">
                    <h3>Patient Profile</h3>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <strong>Name:</strong>
                            <span>${patient.name}</span>
                        </div>
                        <div class="profile-item">
                            <strong>Age:</strong>
                            <span>${patient.age} years</span>
                        </div>
                        <div class="profile-item">
                            <strong>Gender:</strong>
                            <span>${patient.gender}</span>
                        </div>
                        <div class="profile-item">
                            <strong>Date of Birth:</strong>
                            <span>${patient.dob}</span>
                        </div>
                        ${patient.bloodGroup ? `
                        <div class="profile-item">
                            <strong>Blood Group:</strong>
                            <span>${patient.bloodGroup}</span>
                        </div>` : ''}
                        ${patient.contact ? `
                        <div class="profile-item">
                            <strong>Contact:</strong>
                            <span>${patient.contact}</span>
                        </div>` : ''}
                        ${patient.email ? `
                        <div class="profile-item">
                            <strong>Email:</strong>
                            <span>${patient.email}</span>
                        </div>` : ''}
                        ${patient.address ? `
                        <div class="profile-item">
                            <strong>Address:</strong>
                            <span>${patient.address}</span>
                        </div>` : ''}
                    </div>
                </div>

                <div class="section-divider">
                    <h3>Case Histories (${histories.length})</h3>
                </div>
                ${histories.length > 0 ? `
                    <div class="timeline">
                        ${histories.sort((a, b) => new Date(b.date) - new Date(a.date)).map(history => `
                            <div class="timeline-item">
                                <div class="timeline-date">${history.date}</div>
                                <p><strong>Chief Complaint:</strong> ${history.complaint}</p>
                                ${history.symptoms ? `<p><strong>Symptoms:</strong> ${history.symptoms}</p>` : ''}
                                ${history.diagnosis ? `<p><strong>Diagnosis:</strong> ${history.diagnosis}</p>` : ''}
                                ${history.treatment ? `<p><strong>Treatment:</strong> ${history.treatment}</p>` : ''}
                                ${history.notes ? `<p><strong>Notes:</strong> ${history.notes}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="empty-state"><p>No case histories recorded.</p></div>'}

                <div class="section-divider">
                    <h3>Examination Reports (${reports.length})</h3>
                </div>
                ${reports.length > 0 ? `
                    <div class="timeline">
                        ${reports.sort((a, b) => new Date(b.date) - new Date(a.date)).map(report => `
                            <div class="timeline-item">
                                <div class="timeline-date">${report.date}</div>
                                <p><strong>${report.title}</strong> (${report.type})</p>
                                ${report.findings ? `<p><strong>Findings:</strong> ${report.findings}</p>` : ''}
                                ${report.fileName ? `<p><strong>File:</strong> ${report.fileName}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="empty-state"><p>No examination reports recorded.</p></div>'}
            `;
        } catch (error) {
            console.error('Failed to load consolidated view:', error);
            this.showNotification('Failed to load consolidated view', true);
        }
    }

    async deletePatient(id) {
        if (!confirm('Are you sure you want to delete this patient? This will also delete all associated case histories and examination reports.')) {
            return;
        }

        try {
            // Delete associated case histories
            const histories = await medicalDB.getCaseHistoriesByPatient(id);
            for (const history of histories) {
                await medicalDB.deleteCaseHistory(history.id);
            }

            // Delete associated examination reports
            const reports = await medicalDB.getExaminationReportsByPatient(id);
            for (const report of reports) {
                await medicalDB.deleteExaminationReport(report.id);
            }

            // Delete patient
            await medicalDB.deletePatient(id);
            
            this.showNotification('Patient deleted successfully', false);
            await this.loadPatients();
        } catch (error) {
            console.error('Failed to delete patient:', error);
            this.showNotification('Failed to delete patient', true);
        }
    }

    async deleteCaseHistory(id) {
        if (!confirm('Are you sure you want to delete this case history?')) {
            return;
        }

        try {
            await medicalDB.deleteCaseHistory(id);
            this.showNotification('Case history deleted successfully', false);
            await this.loadCaseHistories();
        } catch (error) {
            console.error('Failed to delete case history:', error);
            this.showNotification('Failed to delete case history', true);
        }
    }

    async deleteExaminationReport(id) {
        if (!confirm('Are you sure you want to delete this examination report?')) {
            return;
        }

        try {
            await medicalDB.deleteExaminationReport(id);
            this.showNotification('Examination report deleted successfully', false);
            await this.loadExaminationReports();
        } catch (error) {
            console.error('Failed to delete examination report:', error);
            this.showNotification('Failed to delete examination report', true);
        }
    }

    async downloadReport(id) {
        try {
            const report = await medicalDB.getById('examinationReports', id);
            if (!report.fileData) {
                this.showNotification('No file attached to this report', true);
                return;
            }

            // Create a download link
            const link = document.createElement('a');
            link.href = report.fileData;
            link.download = report.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Report downloaded successfully', false);
        } catch (error) {
            console.error('Failed to download report:', error);
            this.showNotification('Failed to download report', true);
        }
    }

    clearPatientForm() {
        document.getElementById('patient-form').reset();
    }

    clearHistoryForm() {
        document.getElementById('history-form').reset();
    }

    clearReportForm() {
        document.getElementById('report-form').reset();
    }

    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification show' + (isError ? ' error' : '');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
const app = new MedicalApp();
window.app = app;
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
