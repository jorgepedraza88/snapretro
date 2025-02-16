export interface RetrospectivePost {
  id: string;
  userId: string;
  content: string;
  votes: string[];
}

export interface RetrospectiveSection {
  id: string;
  title: string;
  retrospectiveId: string;
  posts: RetrospectivePost[];
}

export interface RetrospectiveData {
  id: string;
  adminId: string;
  adminName: string;
  date: Date;
  enablePassword: boolean;
  allowMessages: boolean;
  allowVotes: boolean;
  password: string | null;
  timer: number;
  enableChat: boolean;
  sections: RetrospectiveSection[];
  status: string;
}
