import Calendar from "react-calendar";
import { Styled } from "./Calendar.styled";

interface CalendarProps {
  setDate: any;
  date: any;
}

const CalendarComponent = (props: CalendarProps) => {
  const { setDate, date } = props;
  return (
    <Styled.CalendarWrraper>
      <Calendar onChange={setDate} value={date} />
    </Styled.CalendarWrraper>
  );
};

export default CalendarComponent;
