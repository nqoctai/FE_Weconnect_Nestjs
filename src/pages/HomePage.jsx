import FriendRequests from "@components/FriendRequests";

import PostCreation from "@components/PostCreation";
import PostList from "@components/PostList";
import SideBar from "@components/SideBar";
import { Button, CircularProgress } from "@mui/material";

function HomePage() {
  return (
    <div className="container">
      <SideBar />
      <div className="flex flex-1 flex-col gap-4">
        <PostCreation />
        <PostList />
      </div>
      <div className="hidden w-72 sm:block">
        <FriendRequests />
      </div>
    </div>
  );
}

export default HomePage;
