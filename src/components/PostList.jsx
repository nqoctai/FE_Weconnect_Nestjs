import Post from "@components/Post";
import React from "react";
import Loading from "@components/Loading";
import { useLazyLoadPost, useUserInfo } from "@hooks/index";
import { Box, Button, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const PostList = () => {
  const { isFetching, posts, refreshPosts } = useLazyLoadPost();
  const userInfo = useUserInfo();

  return (
    <div className="flex flex-col gap-4">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Bài viết</Typography>
        <Button
          startIcon={<Refresh />}
          onClick={refreshPosts}
          disabled={isFetching}
          size="small"
          variant="outlined"
        >
          Làm mới
        </Button>
      </Box>

      {(posts || []).map((post) => (
        <Post
          key={post.id}
          fullName={post.user.name}
          createdAt={post.createdAt}
          content={post.content}
          image={post.image}
          likes={post.likes}
          comments={post.comments}
          postId={post.id}
          isLiked={post.likes.some((like) => like.user.id === userInfo.id)}
        />
      ))}
      {isFetching && <Loading />}
      {!isFetching && posts.length === 0 && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Chưa có bài viết nào.
        </Typography>
      )}
    </div>
  );
};

export default PostList;
