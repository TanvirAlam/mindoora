import { useEffect, useState } from "react";
import { Styled } from "./AddCoverPic.styled";
import { IoIosImages } from "react-icons/io";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import { useRecoilState } from "recoil";

export const AddQuestionPic = ({
  qSource,
  image,
  index,
}: {
  qSource: string;
  image?: File;
  index: number;
}) => {
  const [, setQuestionState] = useRecoilState(questionRecoilState);
  const imageSrc = image ? URL.createObjectURL(image) : null;

  useEffect(() => {
    fetch("/assets/ai/q-bank.png")
      .then((response) => response.blob())
      .then((blob) => {
        const defaultImageFile = new File(
          [blob],
          index.toString() + "_q-bank.png",
          {
            type: "image/png",
          }
        );
        imageSrc === null &&
          setQuestionState((prevState) => {
            const updatedQuestions = [...prevState];
            updatedQuestions[index] = {
              ...updatedQuestions[index],
              qImage: defaultImageFile,
            };
            return updatedQuestions;
          });
      })
      .catch((error) => {
        console.error("Error fetching default image:", error);
      });
  }, []);

  const pictureImage = <IoIosImages size={100} color={"#232752"} />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      setQuestionState((prevState) => {
        const fileName = `${index}_${file.name}`;
        const modifiedFile = new File([file], fileName, { type: file.type });

        const updatedQuestions = [...prevState];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          qImage: modifiedFile,
        };
        return updatedQuestions;
      });
    }
  };

  const pictureImageTxt = (
    <p className="text-lg font-bold uppercase text-[#232752]">Add Image</p>
  );

  return (
    <Styled.PictureWrapper>
      <Styled.Picture htmlFor={image?.name}>
        {imageSrc ? (
          <img src={imageSrc} alt="Selected" />
        ) : (
          <>
            {pictureImage}
            {pictureImageTxt}
            <input
              type="file"
              name={image?.name}
              id={image?.name}
              style={{ display: "none" }} // Hide the file input
              onChange={(e) => handleFileChange(e)}
            />
          </>
        )}
      </Styled.Picture>
      <input
        type="file"
        name={image?.name}
        id={image?.name}
        style={{ display: "none" }} // Hide the file input
        onChange={(e) => handleFileChange(e)}
      />
    </Styled.PictureWrapper>
  );
};
