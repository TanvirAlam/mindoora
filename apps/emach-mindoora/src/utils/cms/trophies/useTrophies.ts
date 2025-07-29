import { useState, useEffect } from "react";
import { fetchTrophies } from "./fetchTropies";

const useTrophies= () => {
  const [trophiesList, setTrophiesList] = useState([]);

  const getTrophiesList = async () => {
    try {
      const res = await fetchTrophies();
      if (res.length > 0) {
        setTrophiesList(res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getTrophiesList();
  }, []);
  return { trophiesList };
};

export default useTrophies;
