import { groq } from "next-sanity";
import { sanityClient } from "../sanity";

const query = groq`*[_type == "mindooraCarousel"]`;

export const fetchCarousel = async () => {
  const cmsCarousel = await sanityClient.fetch(query);
  return cmsCarousel;
};
