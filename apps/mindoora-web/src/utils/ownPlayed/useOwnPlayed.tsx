import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type playerType = {
  name: string;
  image: File | null;
  id: string;
};

export const useOwnPlayed = () => {
  const [formData, setFormData] = useState({ name: "", image: null });
  const [isFormError, setIsFormError] = useState(false);
  const [players, setPlayers] = useState<playerType[]>([]);

  const handleAdd = (e: any) => {
    e.preventDefault();
    if (formData.name && formData.image) {
      setIsFormError(false);
      setPlayers([...players, { ...formData, id: uuidv4() }]);
    } else {
      setIsFormError(true);
    }
  };

  const handleChangeImage = (selectedImage: File) => {
    setFormData({ ...formData, image: selectedImage });
  };

  const handleDelete = (id: string) => {
    const filterData = players.filter((player) => player.id !== id);
    setPlayers(filterData);
  };

  return {
    formData,
    setFormData,
    isFormError,
    players,
    handleAdd,
    handleChangeImage,
    handleDelete,
  };
};
