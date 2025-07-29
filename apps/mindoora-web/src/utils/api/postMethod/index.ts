"use client";
import { apiSetup } from "../api";

export const postMethod = async (route: string, postData: object) => {
  const api = await apiSetup();
  try {
    const response = await api.post(route, postData);
    return response;
  } catch (error) {
    throw error;
  }
};
