// Create this file: src/utils/student-storage.ts
// Utility functions to manage student data persistence

export const STUDENTS_STORAGE_KEY = 'school_students_data';
export const NEXT_ID_STORAGE_KEY = 'school_students_next_id';

// Clear all student data (useful for testing or reset)
export const clearStudentData = () => {
  try {
    localStorage.removeItem(STUDENTS_STORAGE_KEY);
    localStorage.removeItem(NEXT_ID_STORAGE_KEY);
    console.log('Student data cleared from storage');
  } catch (error) {
    console.error('Error clearing student data:', error);
  }
};

// Export student data as JSON (for backup)
export const exportStudentData = () => {
  try {
    const students = localStorage.getItem(STUDENTS_STORAGE_KEY);
    const nextId = localStorage.getItem(NEXT_ID_STORAGE_KEY);

    const exportData = {
      students: students ? JSON.parse(students) : [],
      nextId: nextId ? parseInt(nextId) : 3,
      exportDate: new Date().toISOString()
    };

    // Create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `students-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Student data exported successfully');
  } catch (error) {
    console.error('Error exporting student data:', error);
  }
};

// Import student data from JSON file
export const importStudentData = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importData = JSON.parse(result);

        if (importData.students && Array.isArray(importData.students)) {
          localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(importData.students));

          if (importData.nextId) {
            localStorage.setItem(NEXT_ID_STORAGE_KEY, importData.nextId.toString());
          }

          console.log('Student data imported successfully');
          resolve(importData);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// Get student count
export const getStudentCount = () => {
  try {
    const students = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (students) {
      const parsedStudents = JSON.parse(students);
      return parsedStudents.length;
    }
  } catch (error) {
    console.error('Error getting student count:', error);
  }
  return 0;
};

// Get storage size
export const getStorageSize = () => {
  try {
    const students = localStorage.getItem(STUDENTS_STORAGE_KEY) || '';
    const nextId = localStorage.getItem(NEXT_ID_STORAGE_KEY) || '';
    const totalSize = students.length + nextId.length;

    return {
      bytes: totalSize,
      kb: (totalSize / 1024).toFixed(2),
      mb: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return { bytes: 0, kb: '0', mb: '0' };
  }
};
