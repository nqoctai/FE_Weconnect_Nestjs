import { Comment, ThumbUp } from "@mui/icons-material";
import { Avatar, Button } from "@mui/material";
import {
  useLikePostsMutation,
  useUnLikePostsMutation,
} from "@services/rootApi";
import dayjs from "dayjs";
import React from "react";

const Post = ({
  fullName,
  createdAt,
  content,
  image,
  likes = [],
  comments = [],
  postId,
  isLiked,
}) => {
  const baseImage = `http://localhost:8080/storage/posts`;
  const [likePost] = useLikePostsMutation();
  const [unLikePost] = useUnLikePostsMutation();

  const handleLikePost = async (postId) => {
    console.log("Post ID: ", postId);
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Failed to like post: ", error);
    }
  };

  const handleUnLikePost = async (postId) => {
    console.log("Post ID: ", postId);
    try {
      await unLikePost(postId).unwrap();
    } catch (error) {
      console.error("Failed to un like post: ", error);
    }
  };

  return (
    <div className="card">
      <div className="mb-3 flex gap-3">
        <Avatar className="!bg-primary-main">
          {fullName?.[0]?.toUpperCase()}
        </Avatar>
        <div>
          <p className="font-bold">{fullName}</p>
          <p className="text-sm text-dark-400">
            {dayjs(createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      </div>
      <p className="mb-1">{content}</p>
      {image && <img src={`${baseImage}/${image}`} alt="Post" />}
      <div className="my-2 mt-2 flex items-center justify-between">
        <div className="flex gap-1 text-sm">
          <ThumbUp fontSize="small" className="text-primary-main" />
          <p>{likes.length}</p>
        </div>
        <div className="text-sm">
          <p>{comments.length} comments</p>
        </div>
      </div>
      <div className="flex border-b border-t border-dark-300 py-1 text-sm">
        <Button
          onClick={() => {
            if (isLiked) {
              handleUnLikePost(postId);
            } else {
              handleLikePost(postId);
            }
          }}
          size="small"
          className="flex-1 !text-dark-100"
        >
          <ThumbUp
            fontSize="small"
            className={`mr-1 ${isLiked ? "text-primary-main" : ""}`}
          />{" "}
          Like
        </Button>
        <Button size="small" className="flex-1 !text-dark-100">
          <Comment fontSize="small" className="mr-1" /> Comment
        </Button>
      </div>
    </div>
  );
};

export default Post;
