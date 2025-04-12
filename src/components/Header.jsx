import { useDetectLayout, useLogout, useUserInfo } from "@hooks/index";

import {
  AccountCircle,
  Notifications,
  Search,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
} from "@mui/material";
import { toggleDrawer } from "@redux/slices/settingsSlice";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = useUserInfo();

  const { logOut } = useLogout();

  const { isMediumLayout } = useDetectLayout();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const renderMenu = (
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
    >
      <MenuItem>Profile</MenuItem>
      <MenuItem onClick={() => logOut()}>Logout</MenuItem>
    </Menu>
  );

  const handleUserProfileClick = (event) => {
    setAnchorEl(event.target);
  };

  return (
    <div>
      <AppBar color="white" position="static">
        <Toolbar className="container !min-h-fit justify-between">
          {!isMediumLayout ? (
            <div className="flex items-center gap-4">
              <Link to={"/"}>
                <img src="/weconnect-logo.png" className="h-8 w-8" />
              </Link>

              <div className="ml-4 flex items-center gap-1">
                <Search />
                <TextField
                  variant="standard"
                  name="search"
                  placeholder="Search"
                  slotProps={{
                    input: { className: "h-10 px-3 py-2" },
                    htmlInput: { className: "!p-0" },
                  }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("/search/users", {
                        state: { searchTerm },
                      });
                    }
                  }}
                  sx={{
                    ".MuiInputBase-root::before": {
                      display: "none",
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <IconButton size="medium" onClick={() => dispatch(toggleDrawer())}>
              <MenuIcon />
            </IconButton>
          )}
          <div>
            {isMediumLayout && (
              <IconButton>
                <Search />
              </IconButton>
            )}
            <IconButton size="medium">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton size="medium" onClick={handleUserProfileClick}>
              {/* <AccountCircle /> */}
              <Avatar className="!bg-primary-main">
                {userInfo?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  );
};

export default Header;
