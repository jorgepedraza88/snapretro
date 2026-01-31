import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface EndRetroParams {
  retrospectiveId: string;
}

interface UpdateSettingsParams {
  retrospectiveId: string;
  settings?: {
    allowVotes?: boolean;
    allowMessages?: boolean;
    enableChat?: boolean;
  };
  password?: string;
  sectionsNumber?: number;
}

interface CreateRetroParams {
  name?: string;
  adminId: string;
  avatarUrl: string;
  timer: number;
  allowVotes: boolean;
  enableChat: boolean;
  enablePassword: boolean;
  password: string | null;
  sectionsNumber: number;
}

export function useEndRetroMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ retrospectiveId }: EndRetroParams) => {
      const response = await axios.post(`/api/retro/${retrospectiveId}/end`);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      settings,
      password,
      sectionsNumber
    }: UpdateSettingsParams) => {
      const response = await axios.patch(`/api/retro/${retrospectiveId}/settings`, {
        settings,
        password,
        sectionsNumber
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retrospective', variables.retrospectiveId] });
    }
  });
}

export function useCreateRetroMutation() {
  return useMutation({
    mutationFn: async (params: CreateRetroParams) => {
      const response = await axios.post('/api/retro', params);
      return response.data;
    }
  });
}
