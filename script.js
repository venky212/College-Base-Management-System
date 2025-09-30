const credentials = {
    student: { username: 'student123', password: 'student@123' },
    staff: { username: 'staff123', password: 'staff@123' }
};

const defaultStudentData = {
    name: 'John Doe',
    rollNo: 'STU001',
    marks: {
        'Mathematics': 85,
        'Physics': 78,
        'Chemistry': 82,
        'English': 88,
        'Computer Science': 92
    },
    attendance: {
        total: 100,
        attended: 85
    }
};

function getStudentData() {
    const stored = localStorage.getItem('studentData');
    if (stored) {
        return JSON.parse(stored);
    } else {
        localStorage.setItem('studentData', JSON.stringify(defaultStudentData));
        return defaultStudentData;
    }
}

function saveStudentData(data) {
    localStorage.setItem('studentData', JSON.stringify(data));
}

let studentData = getStudentData();

function login(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    
    if (!userType) {
        errorMsg.textContent = 'Please select user type';
        return;
    }
    
    if (username === credentials[userType].username && password === credentials[userType].password) {
        sessionStorage.setItem('userType', userType);
        sessionStorage.setItem('isLoggedIn', 'true');
        
        if (userType === 'student') {
            window.location.href = 'student-dashboard.html';
        } else {
            window.location.href = 'staff-dashboard.html';
        }
    } else {
        errorMsg.textContent = 'Invalid username or password';
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userType = sessionStorage.getItem('userType');
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.endsWith('index.html') && !currentPage.endsWith('/')) {
        window.location.href = 'index.html';
    }
    
    if (isLoggedIn) {
        if (userType === 'student' && currentPage.endsWith('staff-dashboard.html')) {
            window.location.href = 'student-dashboard.html';
        }
        if (userType === 'staff' && currentPage.endsWith('student-dashboard.html')) {
            window.location.href = 'staff-dashboard.html';
        }
    }
}

function displayStudentDashboard() {
    document.getElementById('studentName').textContent = `Welcome, ${studentData.name}`;
    document.getElementById('detailName').textContent = studentData.name;
    document.getElementById('detailRoll').textContent = studentData.rollNo;
    
    let marksHTML = '<div class="marks-grid">';
    for (let subject in studentData.marks) {
        marksHTML += `
            <div><strong>${subject}</strong></div>
            <div>${studentData.marks[subject]} / 100</div>
        `;
    }
    marksHTML += '</div>';
    document.getElementById('marksTable').innerHTML = marksHTML;
    
    const totalClasses = studentData.attendance.total;
    const attendedClasses = studentData.attendance.attended;
    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2);
    
    document.getElementById('totalClasses').textContent = totalClasses;
    document.getElementById('attendedClasses').textContent = attendedClasses;
    document.getElementById('attendancePercentage').textContent = percentage + '%';
    
    const progressBar = document.getElementById('attendanceProgress');
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage + '%';
}

function displayStaffDashboard() {
    document.getElementById('currentName').textContent = studentData.name;
    document.getElementById('currentRoll').textContent = studentData.rollNo;
    
    const totalClasses = studentData.attendance.total;
    const attendedClasses = studentData.attendance.attended;
    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2);
    
    document.getElementById('currentAttendance').textContent = `${attendedClasses}/${totalClasses} (${percentage}%)`;
    
    let marksHTML = '<div class="marks-grid" style="margin-top: 1rem;">';
    for (let subject in studentData.marks) {
        marksHTML += `
            <div><strong>${subject}</strong></div>
            <div>${studentData.marks[subject]} / 100</div>
        `;
    }
    marksHTML += '</div>';
    document.getElementById('currentMarks').innerHTML = marksHTML;
}

function updateMarks(event) {
    event.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const marks = parseInt(document.getElementById('marks').value);
    const marksMsg = document.getElementById('marksMsg');
    
    if (subject && marks >= 0 && marks <= 100) {
        studentData.marks[subject] = marks;
        saveStudentData(studentData);
        marksMsg.textContent = `Marks updated successfully for ${subject}!`;
        marksMsg.style.display = 'block';
        
        displayStaffDashboard();
        
        document.getElementById('marksForm').reset();
        
        setTimeout(() => {
            marksMsg.textContent = '';
        }, 3000);
    }
}

function updateAttendance(event) {
    event.preventDefault();
    
    const action = document.getElementById('attendanceAction').value;
    const attendanceMsg = document.getElementById('attendanceMsg');
    
    if (action === 'present') {
        studentData.attendance.total++;
        studentData.attendance.attended++;
        attendanceMsg.textContent = 'Student marked present!';
    } else if (action === 'absent') {
        studentData.attendance.total++;
        attendanceMsg.textContent = 'Student marked absent!';
    }
    
    saveStudentData(studentData);
    attendanceMsg.style.display = 'block';
    
    displayStaffDashboard();
    
    document.getElementById('attendanceForm').reset();
    
    setTimeout(() => {
        attendanceMsg.textContent = '';
    }, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    const currentPage = window.location.pathname;
    
    if (currentPage.endsWith('student-dashboard.html')) {
        studentData = getStudentData();
        displayStudentDashboard();
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'studentData') {
                studentData = getStudentData();
                displayStudentDashboard();
            }
        });
        
        setInterval(() => {
            studentData = getStudentData();
            displayStudentDashboard();
        }, 1000);
    }
    
    if (currentPage.endsWith('staff-dashboard.html')) {
        studentData = getStudentData();
        displayStaffDashboard();
        
        const marksForm = document.getElementById('marksForm');
        const attendanceForm = document.getElementById('attendanceForm');
        
        if (marksForm) {
            marksForm.addEventListener('submit', updateMarks);
        }
        
        if (attendanceForm) {
            attendanceForm.addEventListener('submit', updateAttendance);
        }
    }
});