import { groq } from "next-sanity";
import { sanityClient } from "../sanity";

const query = groq`*[_type == "categoryImages"]`;

export const fetchCategoryImages = async () => {
  const cmsCategoryImages = await sanityClient.fetch(query);
  return cmsCategoryImages;
};
