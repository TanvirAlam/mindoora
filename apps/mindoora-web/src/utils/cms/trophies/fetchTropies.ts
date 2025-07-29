import { groq } from "next-sanity";
import { sanityClient } from "../sanity";

const query = groq`*[_type == "mindooraTrophies"]`;

export const fetchTrophies = async () => {
  const cmsCarousel = await sanityClient.fetch(query);
  return cmsCarousel;
};
