import FormControl from "./input";
import { useSubscription } from "~/utils/register/useSubscription";
import { motion } from "framer-motion";
import Description from "./Description";

const SendingEmail = () => {
  const {
    register,
    handleSubmit,
    errors,
    getValues,
    state,
    onSubmit,
    isSubscribed,
  } = useSubscription();

  const handleClick = (e: any) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex-col text-white">
      <Description></Description>
      <div>
        <h1 className="ps-2 pt-4 text-xl font-semibold lg:text-xl xl:text-2xl">
          Start using Mindoora today
        </h1>
        <div className="relative w-80 ps-3 md:w-96">
          {!isSubscribed ? (
            <>
              <FormControl
                label="Email"
                type="text"
                getValue={getValues.email}
                register={register}
                validation={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                name="email"
              />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="bg-gray-500"
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                  width: "auto",
                  height: "auto",
                  borderRadius: ".8rem",
                }}
              >
                <text>Thank You for your Participation.</text>
              </motion.div>
            </>
          )}
        </div>

        {errors.email && (
          <span className="text-xs text-red-600">{errors.email.message}</span>
        )}
      </div>
    </div>
  );
};

export default SendingEmail;
