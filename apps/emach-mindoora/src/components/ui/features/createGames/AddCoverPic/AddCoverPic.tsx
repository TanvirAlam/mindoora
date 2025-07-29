import { useEffect, useState } from "react";
import { Styled } from "./AddCoverPic.styled";
import { IoIosImages } from "react-icons/io";
import { useTranslation } from "react-i18next";

const useImageUpload = (setImage: any, image?: File) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleFileChange = (file: any) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();

      reader.onload = (event) => {
        setImageSrc(event.target.result as string);
      };

      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImageSrc(null);
    }
  };

  return { imageSrc, handleFileChange };
};

export const AddCoverPic = ({
  setImage,
  imageName,
  image,
}: {
  setImage: any;
  imageName: string;
  image?: File;
}) => {
  const { imageSrc, handleFileChange } = useImageUpload(setImage);
  const { t } = useTranslation();

  useEffect(() => {
    handleFileChange(image);
  }, [image]);

  const pictureImage = <IoIosImages size={100} color={"#232752"} />;
  const pictureImageTxt = (
    <span className="text-lg font-bold uppercase text-[#232752]">
      {t("Add Image")}
    </span>
  );

  return (
    <Styled.PictureWrapper>
      <Styled.Picture htmlFor={imageName}>
        {imageSrc ? (
          <img src={imageSrc} alt="Selected" />
        ) : (
          <>
            {pictureImage}
            {pictureImageTxt}
          </>
        )}
      </Styled.Picture>
      <input
        type="file"
        name={imageName}
        id={imageName}
        style={{ display: "none" }} // Hide the file input
        onChange={(e) => handleFileChange(e.target.files && e.target.files[0])}
      />
    </Styled.PictureWrapper>
  );
};
