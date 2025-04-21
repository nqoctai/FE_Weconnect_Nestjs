import axios from '../utils/axios-customize';

// Auth API services
export const callLogin = (username, password) => {
    return axios.post('/auth/login', { username, password });
};

export const callRegister = (name, email, password, phone) => {
    return axios.post('/auth/register', { name, email, password, phone });
};

export const getProfile = () => {
    return axios.get('/auth/profile');
};

export const refreshToken = () => {
    return axios.get('/auth/refresh');
};

export const callLogout = () => {
    return axios.post('/auth/logout');
}

// Posts API services
export const uploadImage = (formData) => {
    return axios.post('/files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createPost = (content, image) => {
    return axios.post('/posts', { content, image });
};

export const getPosts = (page = 1, size = 10) => {
    return axios.get(`/posts?sort=createdAt,desc&page=${page}&size=${size}`);
};

export const likePost = (postId) => {
    return axios.post(`/posts/${postId}/like`);
};

export const unlikePost = (postId) => {
    return axios.delete(`/posts/${postId}/unlike`);
};

export const createComment = (postId, content) => {
    return axios.post(`/posts/${postId}/comments`, { content });
};

// Users API services
export const searchUsers = (filter, page = 0, size = 10) => {
    const encodedQuery = encodeURIComponent(filter.trim());
    return axios.get(`/users?filter=name~'${encodedQuery}'&page=${page}&size=${size}`);
};

// Friends API services
export const sendFriendRequest = (userId) => {
    return axios.post('/friends/request', { receiverId: userId });
};

export const getPendingFriendRequests = () => {
    return axios.get('/friends/requests');
};

export const acceptFriendRequest = (friendRequestId) => {
    return axios.put(`/friends/accept/${friendRequestId}`);
};

export const rejectFriendRequest = (friendRequestId) => {
    return axios.put(`/friends/reject/${friendRequestId}`);
};

// Notifications API services
export const getNotifications = () => {
    return axios.get('/notifications');
};


