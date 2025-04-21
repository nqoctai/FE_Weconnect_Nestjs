import { Check, Close } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import React, { useEffect, useCallback } from "react";
import websocketService from "@services/websocket/websocketService";
import { useSelector } from "react-redux";

import Button from "@components/Button";
import {
  useAcceptFriendRequest,
  useGetPendingFriendRequests,
  useRejectFriendRequest,
} from "@hooks/apiHook";
import { useQueryClient } from "@tanstack/react-query";

const FriendRequestItem = ({ fullName, friendRequestId }) => {
  const acceptFriendRequests = useAcceptFriendRequest();
  const cancelFriendRequests = useRejectFriendRequest();
  const queryClient = useQueryClient();

  const handleAccept = () => {
    console.log("Accept friend request", friendRequestId);
    acceptFriendRequests.mutateAsync(friendRequestId, {
      onSuccess: (data) => {
        console.log("Friend request accepted successfully", data);
        queryClient.invalidateQueries(["pendingFriendRequests"]);
      },
      onError: (error) => {
        console.error("Error accepting friend request", error);
      },
    });
  };

  const handleReject = () => {
    console.log("Reject friend request", friendRequestId);

    cancelFriendRequests.mutateAsync(friendRequestId, {
      onSuccess: (data) => {
        console.log("Friend request rejected successfully", data);
        queryClient.invalidateQueries(["pendingFriendRequests"]);
      },
      onError: (error) => {
        console.error("Error rejecting friend request", error);
      },
    });
  };

  return (
    <div className="flex gap-2">
      <Avatar className="!bg-primary-main">
        {fullName?.[0]?.toUpperCase()}
      </Avatar>
      <div>
        <p className="font-bold">{fullName}</p>
        <div className="mt-2 space-x-1">
          <Button
            variant="contained"
            size="small"
            onClick={handleAccept}
            icon={<Check className="mr-1" fontSize="small" />}
            isLoading={acceptFriendRequests.isLoading}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReject}
            icon={<Close className="mr-1" fontSize="small" />}
            isLoading={cancelFriendRequests.isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const FriendRequests = () => {
  const { user } = useSelector((state) => state.auth);

  // Use the query directly without local state
  const { data, isLoading } = useGetPendingFriendRequests();
  const queryClient = useQueryClient();

  // Get friend requests directly from the query data
  const friendRequests = data?.data || [];

  // Handle new friend request from WebSocket
  const handleNewFriendRequest = useCallback(
    (message) => {
      console.log("Received WebSocket message:", message);

      if (!message) {
        console.warn("Received empty WebSocket message");
        return;
      }

      // Check message type
      if (message.type === "NEW_FRIEND_REQUEST") {
        const newFriendRequest = message.content;
        console.log("New friend request received:", newFriendRequest);

        if (!newFriendRequest?.id) {
          console.warn("Invalid friend request data received");
          return;
        }

        // Instead of updating local state, invalidate the query to refetch
        queryClient.invalidateQueries(["pendingFriendRequests"]);
      }
    },
    [queryClient],
  );

  // Set up WebSocket when component mounts
  useEffect(() => {
    // Ensure user ID is available
    if (!user?.id) {
      console.log("No user ID available, can't connect to WebSocket");
      return;
    }

    console.log("Setting up WebSocket connection for user:", user.id);

    // Connect to WebSocket server
    websocketService
      .connect()
      .then(() => {
        console.log("WebSocket connection established, subscribing to topics");

        // Subscribe to new friend request notifications
        websocketService.subscribeFriendRequests(
          user.id,
          handleNewFriendRequest,
        );

        // Subscribe to debug notifications for monitoring
        websocketService._subscribeToTopic("/topic/debug", (msg) => {
          console.log("Debug notification received:", msg);

          // If debug notification is a friend request for current user, handle it
          if (
            msg?.type === "NEW_FRIEND_REQUEST" &&
            msg?.content?.receiver?.id === user.id
          ) {
            handleNewFriendRequest(msg);
          }
        });
      })
      .catch((error) => {
        console.error("Failed to set up WebSocket connection:", error);
      });

    // Cleanup when component unmounts
    return () => {
      if (user?.id) {
        console.log("Cleaning up WebSocket subscriptions");
        websocketService.unsubscribe(`/topic/friend-requests/${user.id}`);
        websocketService.unsubscribe("/topic/debug");
      }
    };
  }, [user, queryClient, handleNewFriendRequest]);

  if (isLoading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="card">
      <p className="mb-4 font-bold">
        Friends Requests ({friendRequests.length})
      </p>
      <div className="space-y-4">
        {friendRequests && friendRequests.length > 0 ? (
          friendRequests.map((item) => (
            <FriendRequestItem
              key={item.id}
              fullName={item.sender.name}
              id={item.sender.id}
              friendRequestId={item.id}
            />
          ))
        ) : (
          <p>No friend requests</p>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
