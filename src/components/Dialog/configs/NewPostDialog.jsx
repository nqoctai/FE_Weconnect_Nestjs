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
import {
  useCreatePostMutation,
  useUploadImageMutation,
} from "@services/rootApi";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const NewPostDialog = ({ userInfo }) => {
  const [image, setImage] = useState(null);

  const [createNewPost, { isLoading }] = useCreatePostMutation();

  const [uploadImage] = useUploadImageMutation();

  const dispatch = useDispatch();

  const [content, setContent] = useState();

  const handleCreateNewPost = async () => {
    try {
      const formData = new FormData();
      formData.append("folder", "posts");
      formData.append("file", image);

      let uploadResult;
      if (image) {
        uploadResult = await uploadImage(formData).unwrap();
        console.log("res upload", uploadResult);
      }

      const res = await createNewPost({
        content,
        image: uploadResult?.data?.fileName,
      }).unwrap();
      console.log("res", res);
      dispatch(closeDialog());
      dispatch(openSnackbar({ message: "Create Posts Successfully!" }));
    } catch (error) {
      dispatch(openSnackbar({ message: error?.data?.error, type: "error" }));
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
          placeholder="What's on your mine?"
          className="mt-4 w-full p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <ImageUploader image={image} setImage={setImage} />
      </DialogContent>
      <DialogActions className="!px-6 !pb-5 !pt-0">
        <Button
          fullWidth
          disabled={!isValid}
          variant="contained"
          onClick={handleCreateNewPost}
        >
          {isLoading && <CircularProgress size={"16px"} className="mr-1" />}
          Post
        </Button>
      </DialogActions>
    </div>
  );
};

export default NewPostDialog;
