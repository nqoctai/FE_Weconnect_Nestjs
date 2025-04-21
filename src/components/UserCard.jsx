import MyButton from "@components/Button";
import Loading from "@components/Loading";
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useSendFriendRequest,
} from "@hooks/apiHook";
import { Check, Close, MessageOutlined, PersonAdd } from "@mui/icons-material";
import { Avatar, Button, CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({
  id,
  isFriend,
  fullName = "",
  requestSent,
  requestReceived,
  friendRequestId,
}) => {
  // const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();
  // const [acceptFriendRequets, { isLoading: isAccepting, data: acceptData }] =
  //   useAcceptFriendRequestMutation();
  // const [cancelFriendRequets, { isLoading: isCanceling, data: cancelData }] =
  //   useCancelFriendRequestMutation();

  const sendRequest = useSendFriendRequest();
  const acceptFriendRequests = useAcceptFriendRequest();
  const cancelFriendRequests = useRejectFriendRequest();
  const queryClient = useQueryClient();

  const handleSendRequest = async () => {
    console.log("Send friend request", id);
    // Thêm logic gửi lời mời kết bạn ở đây
    await sendRequest.mutateAsync(id, {
      onSuccess: (data) => {
        console.log("Friend request sent successfully", data);
        queryClient.invalidateQueries(["searchUsers"]);
      },
      onError: (error) => {
        console.error("Error sending friend request", error);
      },
    });
  };

  const handleAccept = () => {
    console.log("Accept friend request", friendRequestId);
    // Thêm logic chấp nhận lời mời kết bạn ở đây
    // acceptFriendRequets({ friendRequestId });
    acceptFriendRequests.mutateAsync(friendRequestId, {
      onSuccess: (data) => {
        console.log("Friend request accepted successfully", data);
        queryClient.invalidateQueries(["searchUsers"]);
      },
      onError: (error) => {
        console.error("Error accepting friend request", error);
      },
    });
    // Tag invalidation sẽ tự động xử lý việc cập nhật cache
  };

  const handleReject = () => {
    console.log("Reject friend request", friendRequestId);
    // Thêm logic từ chối lời mời kết bạn ở đây
    // cancelFriendRequets({ friendRequestId });
    cancelFriendRequests.mutateAsync(friendRequestId, {
      onSuccess: (data) => {
        console.log("Friend request rejected successfully", data);
        queryClient.invalidateQueries(["searchUsers"]);
      },
      onError: (error) => {
        console.error("Error rejecting friend request", error);
      },
    });
    // Tag invalidation sẽ tự động xử lý việc cập nhật cache
  };

  const getActionButtons = () => {
    if (isFriend) {
      return (
        <Button variant="contained" size="small">
          <MessageOutlined className="mr-1" fontSize="small" /> Message
        </Button>
      );
    }

    if (requestSent) {
      return (
        <Button variant="contained" size="small" disabled>
          <Check className="mr-1" fontSize="small" /> Request Sent
        </Button>
      );
    }

    if (requestReceived) {
      return (
        <div>
          <div className="mt-2 space-x-1">
            <MyButton
              variant="contained"
              size="small"
              onClick={handleAccept}
              icon={<Check className="mr-1" fontSize="small" />}
              isLoading={acceptFriendRequests.isLoading}
            >
              Accept
            </MyButton>
            <MyButton
              variant="outlined"
              size="small"
              onClick={handleReject}
              icon={<Close className="mr-1" fontSize="small" />}
              isLoading={cancelFriendRequests.isLoading}
            >
              Cancle
            </MyButton>
          </div>
        </div>
      );
    }
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleSendRequest({ userId: id })}
        disabled={sendRequest.isLoading}
      >
        {sendRequest.isLoading ? (
          <CircularProgress className="mr-1 animate-spin" size="16px" />
        ) : (
          <PersonAdd className="mr-1" fontSize="small" />
        )}{" "}
        Add Friend
      </Button>
    );
  };

  return (
    <div className="card flex flex-col items-center">
      <Avatar className="mb-3 !h-12 !w-12 !bg-primary-main">
        {fullName[0]?.toUpperCase()}
      </Avatar>
      <Link>
        <p className="text-lg font-bold">{fullName}</p>
      </Link>
      <div className="mt-4">{getActionButtons()}</div>
    </div>
  );
};

export default UserCard;
