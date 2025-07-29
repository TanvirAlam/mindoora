import toast from "react-hot-toast";
import { apiSetup } from "../api/api";
import { endPoints } from "../api/route";
import { imageResize } from "../imageResize";

const isValidImageType = (mimeType: string) => {
  return mimeType.startsWith("image");
};

export const iUpload = async (image: any) => {
  try {
    const api = await apiSetup();

    if (image instanceof File && !isValidImageType(image.type)) {
      toast.error("Invalid file type.");
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (image instanceof File && image.size > maxSizeInBytes) {
      toast.error("Image size exceeds 2MB");
      return;
    }
    const imageResized = await imageResize(image);

    if (!imageResized) {
      toast.error("Image resize failed.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageResized);

    const response = await api.post(endPoints.image.upload, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response;
  } catch (error: any) {
    console.log(error);
  }
};
