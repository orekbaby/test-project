// File: /src/domains/class/types/class-type.ts

export interface ClassDataProps {
  name: string;
  sections: string; // Comma-separated sections like "A,B,C"
  description?: string;
  capacity?: number;
  teacherId?: number;
  isActive?: boolean;
}

export interface ClassDataPropsWithId extends ClassDataProps {
  id: number;
}

export interface ClassData {
  classes: ClassDataPropsWithId[];
  count?: number;
}

export interface ClassFilter {
  name?: string;
  isActive?: boolean;
  teacherId?: number;
}

export interface ClassSectionData {
  id: number;
  name: string;
  sections: string[];
}

export interface SectionData {
  name: string;
  classId: number;
  capacity?: number;
  studentCount?: number;
}
