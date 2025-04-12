import Post from "@components/Post";

import React from "react";

import Loading from "@components/Loading";
import { DataArray } from "@mui/icons-material";

import { useLazyLoadPost } from "@hooks/index";

const PostList = () => {
  const { isFetching, posts } = useLazyLoadPost();
  return (
    <div className="flex flex-col gap-4">
      {(posts || []).map((post) => (
        <Post
          key={post.id}
          fullName={post.user.name}
          createdAt={post.createdAt}
          content={post.content}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
        />
      ))}
      {isFetching && <Loading />}
    </div>
  );
};

export default PostList;
