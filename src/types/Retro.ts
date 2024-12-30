export interface RetrospectivePost {
  id: string;
  userId: string;
  content: string;
}

export interface RetrospectiveSection {
  id: string;
  title: string;
  posts: RetrospectivePost[];
}

export interface RetrospectiveData {
  id: string;
  adminId: string;
  date: string;
  allowVotes: boolean;
  enablePassword: boolean;
  password: string | null;
  timer: number;
  enableChat: boolean;
  sections: RetrospectiveSection[];
  participants: {
    name: string;
    id: string;
  }[];
}
