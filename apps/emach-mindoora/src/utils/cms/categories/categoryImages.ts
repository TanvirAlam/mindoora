import { useState, useEffect } from "react";
import { fetchCategoryImages } from "./fetchCategoryImages";

const useCategoryImages = () => {
  const [categoryImages, setCategoryImages] = useState([]);

  const getCategoryImages = async () => {
    try {
      const res = await fetchCategoryImages();
      if (res.length > 0) {
        setCategoryImages(res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getCategoryImages();
  }, []);
  return { categoryImages };
};

export default useCategoryImages;
