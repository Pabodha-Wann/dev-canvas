import { getMeAPI, selectRoleAPI, updateProfileAPI } from '../api/auth.api.js';
import useAuthStore from '../store/authStore';

export const authService = {

    getMe: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
            useAuthStore.getState().resetAuth();
            return;
        }

        try {
            useAuthStore.getState().setLoading(true);
            const response = await getMeAPI();

            if (response.data?.success) {
                useAuthStore.getState().setUser(response.data.user);
                useAuthStore.getState().setAuthenticated(true);
            } else {
                useAuthStore.getState().resetAuth();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            useAuthStore.getState().resetAuth();
        } finally {
            useAuthStore.getState().setLoading(false);
        }
    },


    selectRole: async (role) => {
        try {
            useAuthStore.getState().setLoading(true);
            const response = await selectRoleAPI(role);

            if (response.data?.success) {
                const { token, user } = response.data;
                useAuthStore.getState().setToken(token);
                useAuthStore.getState().setUser(user);
                useAuthStore.getState().setLoading(false);
                return { success: true };
            }

            useAuthStore.getState().setLoading(false);
            return { success: false, message: response.data?.message || 'Failed to select role' };
        } catch (error) {
            useAuthStore.getState().setLoading(false);
            return {
                success: false,
                message: error.response?.data?.message || 'Error occurred during role selection'
            };
        }
    },


    updateProfile: async (name, profilePic) => {
        try {
            useAuthStore.getState().setLoading(true);
            const response = await updateProfileAPI(name, profilePic);

            if (response.data?.success) {
                const { token, user } = response.data;
                useAuthStore.getState().setToken(token);
                useAuthStore.getState().setUser(user);
                useAuthStore.getState().setLoading(false);
                return { success: true };
            }

            useAuthStore.getState().setLoading(false);
            return { success: false, message: response.data?.message || 'Failed to update profile' };
        } catch (error) {
            useAuthStore.getState().setLoading(false);
            return {
                success: false,
                message: error.response?.data?.message || 'Error occurred during profile update'
            };
        }
    },


    logout: () => {
        useAuthStore.getState().resetAuth();
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        window.location.href = `${baseURL}/auth/asgardeo/logout`;
    }
};
