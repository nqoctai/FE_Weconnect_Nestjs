import styled from "@emotion/styled";
import { useDetectLayout } from "@hooks/index";
import {
  HomeOutlined,
  Hub,
  Lock,
  Message,
  People,
  Translate,
} from "@mui/icons-material";
import { Drawer, List, ListSubheader } from "@mui/material";
import { toggleDrawer } from "@redux/slices/settingsSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ListStyled = styled(List)`
  padding: 16px 16px;
  border-radius: 4px;
  gap: 4px;
`;

const SideBarContent = () => {
  return (
    <div className="flex w-64 flex-col gap-4">
      <ListStyled className="flex flex-col bg-white shadow">
        <Link to="/" className="flex items-center">
          <HomeOutlined fontSize="small" />
          New Feeds
        </Link>
        <Link to="/message" className="flex items-center">
          <Message fontSize="small" />
          Messenger
        </Link>
        <Link to="/friends" className="flex items-center">
          <People fontSize="small" />
          Friends
        </Link>
        <Link to="/groups" className="flex items-center">
          <Hub fontSize="small" />
          Groups
        </Link>
      </ListStyled>

      <ListStyled className="flex flex-col bg-white shadow">
        <ListSubheader className="mb-2 !px-0 !leading-none">
          Settings
        </ListSubheader>
        <Link to="/settings/account" className="flex items-center">
          <Lock fontSize="small" /> Account
        </Link>
        <Link to="/settings/languages" className="flex items-center">
          <Translate fontSize="small" /> Languages
        </Link>
      </ListStyled>
    </div>
  );
};

const SideBar = () => {
  const { isMediumLayout } = useDetectLayout();
  const isShowDrawer = useSelector((state) => state.settings.isShowDrawer);
  const dispatch = useDispatch();

  return isMediumLayout ? (
    <Drawer
      open={isShowDrawer}
      onClose={() => dispatch(toggleDrawer())}
      classes={{ paper: "p-4 flex flex-col gap-4 !bg-dark-200" }}
    >
      <Link to={"/"}>
        <img src="/weconnect-logo.png" className="h-8 w-8" />
      </Link>
      <SideBarContent />
    </Drawer>
  ) : (
    <SideBarContent />
  );
};

export default SideBar;
