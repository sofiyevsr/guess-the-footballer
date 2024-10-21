import { api } from "../abstractions/api";

export const AssetService = {
  uploadFile: async (file: File) => {
    const response = await api
      .formData({ file })
      .post(undefined, "/asset")
      .json<{ filename: string }>();
    return response;
  },
};
