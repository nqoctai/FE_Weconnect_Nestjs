import { acceptFriendRequest, callLogin, callRegister, createComment, createPost, getNotifications, getPendingFriendRequests, getPosts, getProfile, likePost, rejectFriendRequest, searchUsers, sendFriendRequest, unlikePost, uploadImage } from "@services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () => {
    return useMutation({
      mutationFn: ({ username, password }) => callLogin(username, password),
    });
  };

export const useRegister = () => {
    return useMutation({
      mutationFn: ({ name, email, password, phone }) => callRegister(name, email, password, phone),
    });
  };

export const useGetProfile = () => {
    return useQuery({
      queryKey: ['profile'],
      queryFn: () => getProfile(),
      refetchOnWindowFocus: false,
    });
  }


export const useGetPosts = (page, size) => {
    return useQuery({
      queryKey: ['posts', page, size],
      queryFn: () => getPosts(page, size),
      refetchOnWindowFocus: false,
    });
  }

export const useUploadImage = () => {
    return useMutation({
        mutationFn: (formData) => uploadImage(formData),
    });
  }

export const useCreatePost = () => {
    return useMutation({
        mutationFn: ({ content, image }) => createPost(content, image),
    });
  }

export const useLikePost = () => {
    return useMutation({
        mutationFn: (postId) => likePost(postId),
    });
  }

export const useUnlikePost = () => {
    return useMutation({
        mutationFn: (postId) => unlikePost(postId),
    });
  }

export const useCreateComment = () => {
    return useMutation({
        mutationFn: ({ postId, content }) => createComment(postId, content),
    });
  }

export const useSearchUsers = ({ filter, page, size }) => {
    return useQuery({
        queryKey: ['searchUsers', filter, page, size],
        queryFn: () => searchUsers(filter, page, size),
        refetchOnWindowFocus: false,
    });
  }

export const useSendFriendRequest = () => {
    return useMutation({
        mutationFn: (userId) => sendFriendRequest(userId),
    });
  }

export const useAcceptFriendRequest = () => {
    return useMutation({
        mutationFn: (friendRequestId) => acceptFriendRequest(friendRequestId),
    });
  }

export const useRejectFriendRequest = () => {
    return useMutation({
        mutationFn: (friendRequestId) => rejectFriendRequest(friendRequestId),
    });
  }

export const useGetPendingFriendRequests = () => {
    return useQuery({
        queryKey: ['pendingFriendRequests'],
        queryFn: () => getPendingFriendRequests(),
        refetchOnWindowFocus: false,
    });
  }

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications(),
        refetchOnWindowFocus: false,
    });
  }
