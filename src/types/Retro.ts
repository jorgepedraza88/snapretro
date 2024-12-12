export interface RetrospectivePost {
  id: string;
  content: string;
}

export interface RetrospectiveSection {
  id: string;
  title: string;
  posts: RetrospectivePost[];
}

export interface RetrospectiveData {
  id: string;
  timer: number;
  enableChat: boolean;
  sections: RetrospectiveSection[];
}
