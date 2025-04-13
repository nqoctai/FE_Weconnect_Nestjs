import { Notifications } from "@mui/icons-material";
import { Badge, IconButton } from "@mui/material";
import { useGetNotificationsQuery } from "@services/rootApi";
import React from "react";

const NotificatinosPanel = () => {
  const { data, isLoading, error } = useGetNotificationsQuery();

  // Safely handle the notification count
  const getNotificationCount = () => {
    if (isLoading || error || !data) return 0;

    // Handle different possible response structures
    if (Array.isArray(data)) {
      return data.length;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.length;
    } else if (
      data.data &&
      data.data.result &&
      Array.isArray(data.data.result)
    ) {
      return data.data.result.length;
    } else if (data.data && typeof data.data.count === "number") {
      return data.data.count;
    }

    return 0;
  };

  return (
    <IconButton size="medium">
      <Badge badgeContent={getNotificationCount()} color="error">
        <Notifications />
      </Badge>
    </IconButton>
  );
};

export default NotificatinosPanel;
