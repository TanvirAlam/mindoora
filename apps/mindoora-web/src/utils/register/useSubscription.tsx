import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiSetup } from "../api/api";
import { endPoints } from "../api/route";
import toast from "react-hot-toast";

export const useSubscription = () => {
  const [state, setState] = useState({
    submitting: false,
    SubscriptionData: "",
  });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{ email: string }>();

  const getValues = {
    email: watch("email"),
  };

  const [isSubscribed, setIsSubscribed] = useState(false);

  const onSubmit = async () => {

      const api = await apiSetup();
      api.post(endPoints.subscription.create, getValues)
      .then((res) => {
        toast.success(res.data.message);
        setIsSubscribed(true);
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
};

  return { register, handleSubmit, errors, getValues, state, onSubmit, isSubscribed };
};
