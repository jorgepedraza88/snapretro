export interface RetrospectivePost {
  id: string;
  userId: string;
  content: string;
  votes: string[];
}

export interface RetrospectiveSection {
  id: string;
  title: string;
  posts: RetrospectivePost[];
}

export interface RetrospectiveData {
  id: string;
  adminId: string;
  date: Date;
  allowVotes: boolean;
  enablePassword: boolean;
  password: string | null;
  timer: number;
  enableChat: boolean;
  sections: RetrospectiveSection[];
}
