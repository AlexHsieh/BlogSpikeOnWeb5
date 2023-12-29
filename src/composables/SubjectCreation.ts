export interface Subject {
  title: string;
  description: string;
  authorDid: string;
}

export interface SubjectObject {
  title: string;
  description: string;
  authorDid: string;
  recordId: string;
}

export const createSubject = (
  subjectObject: Partial<SubjectObject>
): SubjectObject => {
  return {
    title: "",
    description: "",
    authorDid: "",
    recordId: "",
    ...subjectObject,
  };
};
