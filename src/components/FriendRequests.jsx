import { Check, Close } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";

import Button from "@components/Button";
import {
  useAcceptFriendRequest,
  useGetPendingFriendRequests,
  useRejectFriendRequest,
} from "@hooks/apiHook";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@context/SocketProvider";

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
  const { data, isLoading } = useGetPendingFriendRequests();
  const queryClient = useQueryClient();
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setFriendRequests(data.data || []);
    }
    const handleFriendRequest = async () => {
      console.log("Friend request received");
      // Gọi lại API hoặc để React Query tự refetch
      await queryClient.invalidateQueries(["pendingFriendRequests"]);
    };
    socket.on("friendRequestReceived", handleFriendRequest);

    return () => {
      socket.off("friendRequestReceived", handleFriendRequest);
    };
  }, [queryClient, data]);

  if (isLoading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="card">
      <p className="mb-4 font-bold">
        Friends Requests ({friendRequests?.length || 0})
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
