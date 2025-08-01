import curriculumData from '../data/curriculum.json';

export interface CurriculumCourse {
  code: string;
  name: string;
  type: string;
  ects: number;
}

export interface CurriculumSemester {
  class: number;
  semester: string;
  courses: CurriculumCourse[];
  elective_courses?: CurriculumCourse[];
}

export interface CurriculumData {
  university: string;
  faculty: string;
  department: string;
  curriculum: CurriculumSemester[];
}

// Tüm dersleri getir
export const getAllCourses = (): CurriculumCourse[] => {
  const courses: CurriculumCourse[] = [];
  
  curriculumData.curriculum.forEach(semester => {
    // Zorunlu dersler
    courses.push(...semester.courses);
    
    // Seçmeli dersler
    if (semester.elective_courses) {
      courses.push(...semester.elective_courses);
    }
  });
  
  return courses;
};

// Belirli bir sınıf ve dönemdeki dersleri getir
export const getCoursesByClassAndSemester = (classYear: number, semester: string): CurriculumCourse[] => {
  const semesterData = curriculumData.curriculum.find(s => 
    s.class === classYear && 
    s.semester.toLowerCase().includes(semester.toLowerCase())
  );
  
  if (!semesterData) return [];
  
  const courses: CurriculumCourse[] = [];
  
  // Zorunlu dersler
  courses.push(...semesterData.courses);
  
  // Seçmeli dersler
  if (semesterData.elective_courses) {
    courses.push(...semesterData.elective_courses);
  }
  
  return courses;
};

// Belirli bir sınıftaki tüm dersleri getir
export const getCoursesByClass = (classYear: number): CurriculumCourse[] => {
  const courses: CurriculumCourse[] = [];
  
  curriculumData.curriculum
    .filter(semester => semester.class === classYear)
    .forEach(semester => {
      courses.push(...semester.courses);
      if (semester.elective_courses) {
        courses.push(...semester.elective_courses);
      }
    });
  
  return courses;
};

// Ders koduna göre ders bilgisi getir
export const getCourseByCode = (code: string): CurriculumCourse | null => {
  const allCourses = getAllCourses();
  return allCourses.find(course => course.code === code) || null;
};

// Ders adına göre ders bilgisi getir
export const getCourseByName = (name: string): CurriculumCourse | null => {
  const allCourses = getAllCourses();
  return allCourses.find(course => 
    course.name.toLowerCase().includes(name.toLowerCase())
  ) || null;
};

// Sınıf ve dönem seçeneklerini getir
export const getClassAndSemesterOptions = () => {
  const options: { class: number; semester: string; label: string }[] = [];
  
  curriculumData.curriculum.forEach(semester => {
    options.push({
      class: semester.class,
      semester: semester.semester,
      label: `${semester.class}. Sınıf - ${semester.semester}`
    });
  });
  
  return options;
};

// Müfredat bilgilerini getir
export const getCurriculumInfo = (): CurriculumData => {
  return {
    university: curriculumData.university,
    faculty: curriculumData.faculty,
    department: curriculumData.department,
    curriculum: curriculumData.curriculum
  };
}; 