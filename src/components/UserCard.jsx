import Loading from "@components/Loading";
import { Check, Close, MessageOutlined, PersonAdd } from "@mui/icons-material";
import { Avatar, Button, CircularProgress } from "@mui/material";
import { useSendFriendRequestMutation } from "@services/rootApi";
import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({
  id,
  isFriend,
  fullName = "",
  requestSent,
  requestReceived,
}) => {
  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();

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
          <Button variant="contained" size="small">
            <Check className="mr-1" fontSize="small" /> Accept
          </Button>
          <Button variant="contained" size="small">
            <Close className="mr-1" fontSize="small" /> Cancel
          </Button>
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
