import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { RetrospectiveData } from '@/types/Retro';

// Helper to map API data (snake_case) to RetrospectiveData (camelCase)
// TODO: Eliminar cuando refactorizemos todo
const mapToRetrospectiveData = (apiData: any): RetrospectiveData => {
  const settings = apiData.settings || {};
  return {
    id: apiData.id,
    adminId: apiData.admin_id,
    adminName: settings.adminName || '',
    date: apiData.created_at ? new Date(apiData.created_at) : new Date(),
    enablePassword: settings.enablePassword || false,
    allowMessages: settings.allowMessages || false,
    allowVotes: settings.allowVotes || false,
    password: apiData.secret_word || null,
    timer: apiData.timer || 0,
    enableChat: settings.enableChat || false,
    status: apiData.status,
    sections: (apiData.sections || []).map((s: any) => ({
      id: s.id,
      title: s.name,
      retrospectiveId: s.retrospective_id,
      posts: (s.posts || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        content: p.content,
        votes: p.votes || []
      }))
    }))
  };
};

const fetchRetrospective = async (id: string): Promise<RetrospectiveData> => {
  const response = await axios.get(`/api/retro/${id}`);
  return mapToRetrospectiveData(response.data);
};

export function useRetrospectiveQuery(id: string) {
  return useQuery({
    queryKey: ['retrospective', id],
    queryFn: () => fetchRetrospective(id),
    staleTime: Infinity,
    enabled: !!id
  });
}
