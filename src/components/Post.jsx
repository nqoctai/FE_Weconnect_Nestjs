import { useCreateComment, useLikePost, useUnlikePost } from "@hooks/apiHook";
import { useUserInfo } from "@hooks/index";
import { Comment, Send, ThumbUp } from "@mui/icons-material";
import { Avatar, Button, IconButton, TextField } from "@mui/material";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useState } from "react";

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
  const userInfo = useUserInfo();
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [comment, setComment] = useState("");

  const baseImage = `http://localhost:8080/storage/posts`;

  const likePost = useLikePost();
  const unLikePost = useUnlikePost();
  const conmmentPost = useCreateComment();
  const queryClient = useQueryClient();

  const handleLikePost = async (postId) => {
    console.log("Post ID: ", postId);
    try {
      // await likePost(postId).unwrap();
      await likePost.mutateAsync(postId, {
        onSuccess: (data) => {
          console.log("Post liked successfully: ", data);
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
      });
    } catch (error) {
      console.error("Failed to like post: ", error);
    }
  };

  const handleUnLikePost = async (postId) => {
    console.log("Post ID: ", postId);
    try {
      await unLikePost.mutateAsync(postId, {
        onSuccess: (data) => {
          console.log("Post unliked successfully: ", data);
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
      });
    } catch (error) {
      console.error("Failed to un like post: ", error);
    }
  };

  const handleComment = async (postId) => {
    try {
      console.log("Post ID: ", postId);
      console.log("Comment: ", comment);
      // await conmmentPost({ postId, content: comment }).unwrap();
      await conmmentPost.mutateAsync(
        { postId, content: comment },
        {
          onSuccess: (data) => {
            console.log("Commented successfully: ", data);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
          },
          onError: (error) => {
            console.error("Failed to comment: ", error);
            openSnackbar({
              message: error?.data?.error || "Failed to comment",
              type: "error",
            });
          },
        },
      );
      setComment("");
      setIsCommentBoxOpen(false);
    } catch (error) {
      console.error("Failed to comment: ", error);
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
        <Button
          size="small"
          className="flex-1 !text-dark-100"
          onClick={() => setIsCommentBoxOpen(!isCommentBoxOpen)}
        >
          <Comment fontSize="small" className="mr-1" /> Comment
        </Button>
      </div>
      {isCommentBoxOpen && (
        <>
          <div className="max-h-48 overflow-y-auto py-2">
            {[...comments].reverse().map((comment) => (
              <div key={comment.id} className="flex gap-2 px-4 py-2">
                <Avatar className="!h-6 !w-6 !bg-primary-main">
                  {comment?.user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold">{comment?.user?.name}</p>
                    <p className="text-xs text-dark-400">
                      {dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  <p>{comment?.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card flex items-center gap-2">
            <Avatar className="!h-6 !w-6 !bg-primary-main">
              {userInfo?.name?.[0]?.toUpperCase()}
            </Avatar>
            <TextField
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
              size="small"
              placeholder="Comment..."
            />
            <IconButton
              onClick={() => handleComment(postId)}
              disabled={!comment}
            >
              <Send className="text-primary-main" />
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};

export default Post;
