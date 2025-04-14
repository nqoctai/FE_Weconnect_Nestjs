import { Circle, Notifications } from "@mui/icons-material";
import { Avatar, Badge, IconButton, Menu, MenuItem } from "@mui/material";
import { useGetNotificationsQuery } from "@services/rootApi";
import React, { useState } from "react";

const NotificatinosPanel = () => {
  const { data, isLoading, error } = useGetNotificationsQuery();
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.target);
  };

  const renderNotificationsMenu = (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      classes={{ paper: "!min-w-80 !max-h-80 scroll-y-auto" }}
    >
      {(data?.data?.result || []).map((notification) => (
        <MenuItem
          key={notification.id}
          className="flex items-center !justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Avatar className="!bg-primary-main" fontSize="small">
              {notification?.userName?.[0]?.toUpperCase()}
            </Avatar>
            <div className="text-sm font-semibold">{notification.content}</div>
          </div>
          <div>
            {!notification.read && (
              <Circle className="text-primary-main" fontSize="10px" />
            )}
          </div>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      <IconButton size="medium" onClick={handleNotificationsClick}>
        <Badge badgeContent={getNotificationCount()} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      {renderNotificationsMenu}
    </>
  );
};

export default NotificatinosPanel;
