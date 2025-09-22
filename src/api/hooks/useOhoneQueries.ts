import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../";
import type { Phone, NewPhone } from "../../types";

const PHONE_QUERY_KEY = ["phones"];

export const usePhone = () => {
  const queryClient = useQueryClient();

  const phones = useQuery({
    queryKey: PHONE_QUERY_KEY,
    queryFn: async (): Promise<Phone[]> => {
      const { data } = await api.get<Phone[]>("/phone");
      return data;
    },
  });

  const addPhone = useMutation({
    mutationFn: async (newPhone: NewPhone) => {
      const { data } = await api.post<Phone>("/phone", newPhone);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHONE_QUERY_KEY });
    },
  });

  const updatePhone = useMutation({
    mutationFn: async (phoneToUpdate: Phone) => {
      const { id, ...updateData } = phoneToUpdate;
      const { data } = await api.put<Phone>(`/phone/${id}`, updateData);
      return data;
    },
    onSuccess: (updatedPhone) => {
      queryClient.invalidateQueries({ queryKey: PHONE_QUERY_KEY });
      queryClient.setQueryData(
        [...PHONE_QUERY_KEY, updatedPhone.id],
        updatedPhone
      );
    },
  });

  const deletePhone = useMutation({
    mutationFn: async (id: Phone["id"]) => {
      await api.delete(`/phone/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHONE_QUERY_KEY });
    },
  });

  return {
    phones,
    addPhone,
    updatePhone,
    deletePhone,
  };
};
