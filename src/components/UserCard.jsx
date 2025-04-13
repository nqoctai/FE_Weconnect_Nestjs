import MyButton from "@components/Button";
import Loading from "@components/Loading";
import { Check, Close, MessageOutlined, PersonAdd } from "@mui/icons-material";
import { Avatar, Button, CircularProgress } from "@mui/material";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useSendFriendRequestMutation,
} from "@services/rootApi";
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
  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();
  const [acceptFriendRequets, { isLoading: isAccepting, data: acceptData }] =
    useAcceptFriendRequestMutation();
  const [cancelFriendRequets, { isLoading: isCanceling, data: cancelData }] =
    useCancelFriendRequestMutation();

  const handleAccept = () => {
    console.log("Accept friend request", friendRequestId);
    // Thêm logic chấp nhận lời mời kết bạn ở đây
    acceptFriendRequets({ friendRequestId });
    // Tag invalidation sẽ tự động xử lý việc cập nhật cache
  };

  const handleReject = () => {
    console.log("Reject friend request", friendRequestId);
    // Thêm logic từ chối lời mời kết bạn ở đây
    cancelFriendRequets({ friendRequestId });
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
              isLoading={isAccepting}
            >
              Accept
            </MyButton>
            <MyButton
              variant="outlined"
              size="small"
              onClick={handleReject}
              icon={<Close className="mr-1" fontSize="small" />}
              isLoading={isCanceling}
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
        onClick={() => sendFriendRequest({ userId: id })}
        disabled={isLoading}
      >
        {isLoading ? (
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
