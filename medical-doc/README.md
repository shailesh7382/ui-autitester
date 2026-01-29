# Medical Documentation System

A comprehensive web-based medical documentation system for managing patient profiles, case histories, and examination reports with offline storage using IndexedDB.

## Features

### 1. Patient Profile Management
- Create and manage patient profiles with detailed information
- Store patient demographics (name, age, gender, DOB)
- Track medical information (blood group)
- Maintain contact information (phone, email, address)
- View all patients in a card-based interface
- Delete patient records (including all associated data)

### 2. Case History Management
- Record detailed case histories for each patient
- Track chief complaints, symptoms, diagnosis, and treatment
- Add additional notes for each visit
- View all case histories for a selected patient
- Sort histories by date (most recent first)
- Delete individual case histories

### 3. Examination Reports
- Upload and manage examination reports
- Support multiple report types:
  - Blood Test
  - X-Ray
  - MRI
  - CT Scan
  - Ultrasound
  - ECG
  - Other
- Store report findings and metadata
- Attach files to reports (PDF, images, documents)
- Download attached report files
- View all reports for a selected patient

### 4. Consolidated View
- View complete medical history for any patient
- Single-page view combining:
  - Patient profile information
  - All case histories (in timeline format)
  - All examination reports (in timeline format)
- Chronologically organized medical records

### 5. IndexedDB Backend
- All data stored locally in browser using IndexedDB
- No server required - fully client-side
- Offline-capable
- Three object stores:
  - `patients` - Patient profile information
  - `caseHistories` - Patient case histories
  - `examinationReports` - Examination reports with files

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: IndexedDB API
- **Testing**: Playwright for end-to-end testing
- **Server**: http-server for local development

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shailesh7382/ui-autitester.git
cd ui-autitester
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

### Running the Application

Start the local server:
```bash
npm run serve
```

Then open your browser and navigate to:
```
http://localhost:8080
```

## Testing

The project includes a comprehensive Playwright test suite covering all features.

### Run all tests:
```bash
npm test
```

### Run tests in UI mode (interactive):
```bash
npm run test:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:headed
```

### View test report:
```bash
npm run test:report
```

## Test Coverage

The test suite includes:

### Patient Profile Tests (`patient.spec.js`)
- Application loading and initialization
- Patient profile creation
- Form validation
- Multiple patient management
- Patient deletion
- Form clearing

### Case History Tests (`case-history.spec.js`)
- Navigation to case history section
- Patient selector functionality
- Case history creation
- Form validation
- Multiple histories per patient
- Case history deletion
- Empty state handling

### Examination Reports Tests (`examination-reports.spec.js`)
- Navigation to reports section
- Patient selector functionality
- Report creation (with and without files)
- Form validation
- Multiple report types
- Report deletion
- Empty state handling

### Consolidated View Tests (`consolidated-view.spec.js`)
- Patient profile display
- Case histories timeline
- Examination reports timeline
- Complete medical history view
- Multiple patient handling
- Empty state handling

## Project Structure

```
ui-autitester/
├── medical-doc/
│   ├── index.html              # Main application HTML
│   ├── src/
│   │   ├── styles.css          # Application styles
│   │   ├── db.js               # IndexedDB service
│   │   └── app.js              # Main application logic
│   └── tests/
│       ├── patient.spec.js             # Patient profile tests
│       ├── case-history.spec.js        # Case history tests
│       ├── examination-reports.spec.js # Examination reports tests
│       └── consolidated-view.spec.js   # Consolidated view tests
├── playwright.config.js        # Playwright configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Usage Guide

### Creating a Patient Profile
1. Navigate to the "Patient Profile" section (default view)
2. Fill in the required fields (Name, Age, Gender, Date of Birth)
3. Optionally add blood group, contact information, and address
4. Click "Save Patient"
5. The patient will appear in the patient list below

### Adding Case History
1. Navigate to the "Case History" section
2. Select a patient from the dropdown
3. Enter the date and chief complaint (required)
4. Add symptoms, diagnosis, treatment, and notes (optional)
5. Click "Save Case History"
6. The history will appear in the case histories list

### Adding Examination Reports
1. Navigate to the "Examination Reports" section
2. Select a patient from the dropdown
3. Enter report date, type, and title (required)
4. Add findings (optional)
5. Optionally upload a file (PDF, images, or documents)
6. Click "Save Report"
7. The report will appear in the reports list

### Viewing Consolidated Information
1. Navigate to the "Consolidated View" section
2. Select a patient from the dropdown
3. View complete medical history including:
   - Patient profile details
   - All case histories (chronologically ordered)
   - All examination reports (chronologically ordered)

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

All modern browsers that support IndexedDB are compatible.

## Data Persistence

All data is stored locally in your browser using IndexedDB. This means:
- ✅ Data persists across browser sessions
- ✅ No server or internet connection required
- ✅ Fast and responsive
- ⚠️ Data is specific to the browser and device
- ⚠️ Clearing browser data will delete all records

## Security Considerations

- All data is stored locally in the browser
- No data is transmitted to external servers
- Consider implementing authentication for production use
- Regular backups are recommended (export/import functionality can be added)

## Future Enhancements

Possible improvements for future versions:
- Export/Import data functionality (JSON, CSV)
- Print patient reports
- Search and filter capabilities
- Data backup to cloud storage
- Multi-user support with authentication
- Medication tracking
- Appointment scheduling
- Report templates
- Data encryption

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Submit a pull request

## License

ISC

## Author

Shailesh7382

## Support

For issues, questions, or contributions, please open an issue on GitHub.
