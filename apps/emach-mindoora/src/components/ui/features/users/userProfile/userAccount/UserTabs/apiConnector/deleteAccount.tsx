import { apiSetup } from "~/utils/api/api";
import {endPoints} from "~/utils/api/route";
import { signOut } from "next-auth/react";

export const deleteAccount = async () => {
    try {
        const api = await apiSetup();
        const response = await api.delete(endPoints.account.delete);
        if (response.status === 204) {
            await signOut();
        }
    } catch (error: any) {
        return error;
    }
}
