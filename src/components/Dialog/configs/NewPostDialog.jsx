import { ImageUploader } from "@components/PostCreation";
import {
  Avatar,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  TextareaAutosize,
} from "@mui/material";
import { closeDialog } from "@redux/slices/dialogSlice";
import { openSnackbar } from "@redux/slices/snackbarSlice";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useCreatePost, useUploadImage } from "@hooks/apiHook";
import { useQueryClient } from "@tanstack/react-query";

const NewPostDialog = ({ userInfo }) => {
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: uploadImageAsync } = useUploadImage();
  const { mutateAsync: createPostAsync } = useCreatePost();
  const dispatch = useDispatch();
  const [content, setContent] = useState("");

  const handleCreateNewPost = async () => {
    try {
      setIsSubmitting(true);

      // Biến lưu trữ tên file ảnh sau khi upload (nếu có)
      let imageFileName = null;

      // Nếu có ảnh, upload ảnh trước
      if (image) {
        const formData = new FormData();
        formData.append("folder", "posts");
        formData.append("file", image);

        console.log("Uploading image...");

        try {
          // Sử dụng mutateAsync để đợi kết quả upload
          const uploadResult = await uploadImageAsync(formData);
          console.log("Image uploaded successfully", uploadResult);

          if (uploadResult?.data?.fileName) {
            imageFileName = uploadResult.data.fileName;
            console.log("Image file name:", imageFileName);
          }
        } catch (uploadError) {
          console.error("Image upload failed", uploadError);
          const backendError = uploadError?.response?.data;
          dispatch(
            openSnackbar({
              message: backendError?.error || "Không thể tải ảnh lên",
              type: "error",
            }),
          );
          setIsSubmitting(false);
          return; // Dừng quá trình nếu upload ảnh thất bại
        }
      }

      // Sau khi đã upload ảnh thành công (hoặc không có ảnh), tạo bài viết
      console.log(
        "Creating post with content and image:",
        content,
        imageFileName,
      );

      try {
        // Tạo bài viết với ảnh (nếu có)
        const postResult = await createPostAsync({
          content,
          image: imageFileName,
        });

        console.log("Post created successfully", postResult);

        // Invalidate tất cả queries liên quan đến posts
        queryClient.invalidateQueries({ queryKey: ["posts"] });

        // Đóng dialog và hiển thị thông báo thành công
        dispatch(closeDialog());
        dispatch(openSnackbar({ message: "Tạo bài viết thành công!" }));
      } catch (postError) {
        console.error("Post creation failed", postError);
        const backendError = postError?.response?.data;
        dispatch(
          openSnackbar({
            message: backendError?.error || "Không thể tạo bài viết",
            type: "error",
          }),
        );
      }
    } catch (error) {
      console.error("Unexpected error", error);
      dispatch(
        openSnackbar({
          message: "Đã xảy ra lỗi không xác định",
          type: "error",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content || image;

  return (
    <div>
      <DialogContent>
        <div className="flex items-center gap-2">
          <Avatar className="!bg-primary-main" sx={{ width: 32, height: 32 }}>
            {userInfo?.name?.[0]?.toUpperCase()}
          </Avatar>
          <p className="font-bold">{userInfo?.name}</p>
        </div>
        <TextareaAutosize
          minRows={3}
          placeholder="Bạn đang nghĩ gì?"
          className="mt-4 w-full p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <ImageUploader image={image} setImage={setImage} />
      </DialogContent>
      <DialogActions className="!px-6 !pb-5 !pt-0">
        <Button
          fullWidth
          disabled={!isValid || isSubmitting}
          variant="contained"
          onClick={handleCreateNewPost}
        >
          {isSubmitting && <CircularProgress size={"16px"} className="mr-2" />}
          Đăng bài
        </Button>
      </DialogActions>
    </div>
  );
};

export default NewPostDialog;
