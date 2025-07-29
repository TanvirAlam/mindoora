import { motion } from "framer-motion";
import { TimePicker } from "../../timepicker";

interface ActionProps {
  setDate: any;
  date: any;
  selectRange: boolean;
  setSelectRange: any;
}

const Actions = (props: ActionProps) => {
  const { setDate, date, selectRange, setSelectRange } = props;
  return (
    <motion.div
      initial={{ y: 1000 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
    >
      {date.length > 0 && selectRange ? (
        <p className="text-center">
          {date[0].toDateString()}
          &nbsp;-&nbsp;
          {date[1].toDateString()}
        </p>
      ) : (
        <div className="flex items-center justify-center pt-12">
          <TimePicker dataString={date.toDateString()} />
        </div>
      )}
    </motion.div>
  );
};

export default Actions;
