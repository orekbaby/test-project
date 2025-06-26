// Mock Student API that saves to memory instead of calling backend
// Replace your studentApi.ts with this fixed version

import { api, Tag } from '@/api';
import {
  AddStudent,
  GetStudentDetailProps,
  GetTeachers,
  ReviewStudentStatusRequest,
  StudentData,
  StudentFilter,
  StudentProps,
  StudentPropsWithId
} from '../types';

// Type for stored students
interface StoredStudent {
  id: number;
  name: string;
  email: string;
  lastLogin: string;
  systemAccess: boolean;
  role: string;
  [key: string]: any; // Allow additional properties
}

// localStorage keys
const STORAGE_KEY = 'students_data';
const NEXT_ID_KEY = 'students_next_id';

// Load from localStorage
const loadFromStorage = (): StoredStudent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Storage load error:', error);
  }
  return [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      lastLogin: '2024-01-15',
      systemAccess: true,
      role: 'student'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      lastLogin: '2024-01-14',
      systemAccess: true,
      role: 'student'
    }
  ];
};

// Save to localStorage
const saveToStorage = (data: StoredStudent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Storage save error:', error);
  }
};

// Load next ID
const loadNextId = (): number => {
  try {
    const stored = localStorage.getItem(NEXT_ID_KEY);
    if (stored) return parseInt(stored);
  } catch (error) {
    console.error('Next ID load error:', error);
  }
  return 3;
};

// Save next ID
const saveNextId = (id: number) => {
  try {
    localStorage.setItem(NEXT_ID_KEY, id.toString());
  } catch (error) {
    console.error('Next ID save error:', error);
  }
};

// In-memory storage for students (this will work without backend)
let studentsStorage = loadFromStorage();
let nextStudentId = loadNextId();

// Helper function to simulate API delay
const simulateApiDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

export const studentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<StudentData, StudentFilter>({
      queryFn: async (payload) => {
        await simulateApiDelay();

        // Reload from storage
        studentsStorage = loadFromStorage();

        // Filter students based on payload if needed
        let filteredStudents = [...studentsStorage];

        // Safe check for payload.name
        if (payload.name && payload.name.trim()) {
          filteredStudents = filteredStudents.filter((student: StoredStudent) =>
            student.name.toLowerCase().includes(payload.name!.toLowerCase())
          );
        }

        return {
          data: {
            students: filteredStudents,
            count: filteredStudents.length
          }
        };
      },
      providesTags: (result) =>
        result?.students?.map(({ id }) => {
          return { type: Tag.STUDENTS, id };
        }) || [{ type: Tag.STUDENTS }]
    }),

    getStudentDetail: builder.query<GetStudentDetailProps, string | undefined>({
      queryFn: async (id) => {
        await simulateApiDelay();

        if (!id) {
          return { error: { status: 400, data: 'Student ID is required' } };
        }

        // Reload from storage
        studentsStorage = loadFromStorage();

        const student = studentsStorage.find((s: StoredStudent) => s.id === parseInt(id));

        if (!student) {
          return { error: { status: 404, data: 'Student not found' } };
        }

        // Return full student details (expand as needed)
        return {
          data: {
            id: student.id,
            name: student.name,
            email: student.email,
            systemAccess: student.systemAccess,
            phone: '123-456-7890',
            gender: 'Male',
            dob: '1990-01-01',
            class: '10',
            section: 'A',
            roll: '001',
            fatherName: 'Father Name',
            fatherPhone: '123-456-7890',
            motherName: 'Mother Name',
            motherPhone: '123-456-7890',
            guardianName: '',
            guardianPhone: '',
            relationOfGuardian: '',
            currentAddress: 'Current Address',
            permanentAddress: 'Permanent Address',
            admissionDate: '2024-01-01',
            reporterName: 'Admin'
          }
        };
      },
      providesTags: (result) => (result ? [{ type: Tag.STUDENTS, id: result.id }] : [])
    }),

    reviewStudentStatus: builder.mutation<{ message: string }, ReviewStudentStatusRequest>({
      queryFn: async ({ id, status }) => {
        await simulateApiDelay();

        // Reload from storage
        studentsStorage = loadFromStorage();

        const studentIndex = studentsStorage.findIndex(
          (s: StoredStudent) => s.id === parseInt(id.toString())
        );

        if (studentIndex === -1) {
          return { error: { status: 404, data: 'Student not found' } };
        }

        studentsStorage[studentIndex].systemAccess = status;

        // Save to storage
        saveToStorage(studentsStorage);

        return {
          data: { message: 'Student status updated successfully' }
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: Tag.STUDENTS, id: id.toString() }]
    }),

    addStudent: builder.mutation<AddStudent, StudentProps>({
      queryFn: async (payload) => {
        await simulateApiDelay();

        console.log('Adding student with payload:', payload);

        // Reload from storage
        studentsStorage = loadFromStorage();
        nextStudentId = loadNextId();

        // Create new student object
        const newStudent: StoredStudent = {
          id: nextStudentId,

          lastLogin: new Date().toISOString().split('T')[0],

          role: 'student' as const,
          ...payload // Add any additional fields from payload
        };

        // Add to our storage
        studentsStorage.push(newStudent);

        // Save to localStorage
        saveToStorage(studentsStorage);
        saveNextId(nextStudentId + 1);

        console.log('Student added successfully:', newStudent);
        console.log('Current students storage:', studentsStorage);

        // Return success message with required id property
        const response: AddStudent = {
          id: nextStudentId, // Include the required id property
          message: payload.email
            ? 'Student added and verification email sent successfully.'
            : 'Student added successfully.'
        };

        // Increment for next student
        nextStudentId++;

        return {
          data: response
        };
      },
      invalidatesTags: [Tag.STUDENTS]
    }),

    updateStudent: builder.mutation<{ message: string }, StudentPropsWithId>({
      queryFn: async ({ id, ...payload }) => {
        await simulateApiDelay();

        // Reload from storage
        studentsStorage = loadFromStorage();

        const studentIndex = studentsStorage.findIndex(
          (s: StoredStudent) => s.id === parseInt(id.toString())
        );

        if (studentIndex === -1) {
          return { error: { status: 404, data: 'Student not found' } };
        }

        // Update student - avoid property overwriting
        studentsStorage[studentIndex] = {
          ...studentsStorage[studentIndex],
          ...payload,
          id: parseInt(id.toString()) // Ensure id remains a number
        };

        // Save to storage
        saveToStorage(studentsStorage);

        return {
          data: { message: 'Student updated successfully' }
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: Tag.STUDENTS, id: id.toString() }]
    }),

    getTeachers: builder.query<GetTeachers, void>({
      queryFn: async () => {
        await simulateApiDelay();

        // Return mock teachers data
        return {
          data: {
            teachers: [
              { id: 1, name: 'Teacher One' },
              { id: 2, name: 'Teacher Two' }
            ]
          }
        };
      }
    })
  })
});

export const {
  useGetStudentsQuery,
  useLazyGetStudentDetailQuery,
  useReviewStudentStatusMutation,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useGetTeachersQuery
} = studentApi;
