// IndexedDB Database Service
class MedicalDB {
    constructor() {
        this.dbName = 'MedicalDocDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('patients')) {
                    const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
                    patientStore.createIndex('name', 'name', { unique: false });
                    patientStore.createIndex('email', 'email', { unique: false });
                }

                if (!db.objectStoreNames.contains('caseHistories')) {
                    const historyStore = db.createObjectStore('caseHistories', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('patientId', 'patientId', { unique: false });
                    historyStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('examinationReports')) {
                    const reportStore = db.createObjectStore('examinationReports', { keyPath: 'id', autoIncrement: true });
                    reportStore.createIndex('patientId', 'patientId', { unique: false });
                    reportStore.createIndex('date', 'date', { unique: false });
                    reportStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Generic method to add data to a store
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to add data to ${storeName}`));
            };
        });
    }

    // Generic method to get all data from a store
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to get data from ${storeName}`));
            };
        });
    }

    // Generic method to get data by ID
    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to get data from ${storeName}`));
            };
        });
    }

    // Generic method to get data by index
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to get data from ${storeName} by index ${indexName}`));
            };
        });
    }

    // Generic method to update data
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to update data in ${storeName}`));
            };
        });
    }

    // Generic method to delete data
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(new Error(`Failed to delete data from ${storeName}`));
            };
        });
    }

    // Patient-specific methods
    async addPatient(patientData) {
        return this.add('patients', patientData);
    }

    async getAllPatients() {
        return this.getAll('patients');
    }

    async getPatient(id) {
        return this.getById('patients', id);
    }

    async updatePatient(patientData) {
        return this.update('patients', patientData);
    }

    async deletePatient(id) {
        return this.delete('patients', id);
    }

    // Case History-specific methods
    async addCaseHistory(historyData) {
        return this.add('caseHistories', historyData);
    }

    async getAllCaseHistories() {
        return this.getAll('caseHistories');
    }

    async getCaseHistoriesByPatient(patientId) {
        return this.getByIndex('caseHistories', 'patientId', patientId);
    }

    async updateCaseHistory(historyData) {
        return this.update('caseHistories', historyData);
    }

    async deleteCaseHistory(id) {
        return this.delete('caseHistories', id);
    }

    // Examination Report-specific methods
    async addExaminationReport(reportData) {
        return this.add('examinationReports', reportData);
    }

    async getAllExaminationReports() {
        return this.getAll('examinationReports');
    }

    async getExaminationReportsByPatient(patientId) {
        return this.getByIndex('examinationReports', 'patientId', patientId);
    }

    async updateExaminationReport(reportData) {
        return this.update('examinationReports', reportData);
    }

    async deleteExaminationReport(id) {
        return this.delete('examinationReports', id);
    }

    // Clear all data (useful for testing)
    async clearAll() {
        const stores = ['patients', 'caseHistories', 'examinationReports'];
        for (const storeName of stores) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
            });
        }
    }
}

// Create a global instance
const medicalDB = new MedicalDB();
window.medicalDB = medicalDB;
