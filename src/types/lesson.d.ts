export type Lesson = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  youTubeUrl: string;
  isFree: boolean;
};
export type Lessons = Lesson[];

export type LessonModule = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export type LessonModules = LessonModule[];
