import { useState, useEffect } from "react";
import { fetchCarousel } from "./fetchCarousel";
import { type CarouselType } from "~/types/type";

const useCarousel = () => {
  const [carouselList, setCarouselList] = useState<CarouselType[]>([]);

  const getCarouselList = async () => {
    try {
      const res = await fetchCarousel();
      if (res.length > 0) {
        setCarouselList(res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getCarouselList();
  }, []);
  return { carouselList };
};

export default useCarousel;
