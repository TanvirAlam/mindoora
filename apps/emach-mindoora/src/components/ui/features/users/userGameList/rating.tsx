import StarBorderIcon from "@mui/icons-material/StarBorder";
import Ratings from "@mui/material/Rating";

type Props = {
  rating: number;
};

const Rating = ({ rating }: Props) => {
  const currentRating = Math.floor(rating);
  const ratings = rating - currentRating;

  return (
    <div className="pb-2 pt-2">
      <Ratings
        name="half-rating-read"
        defaultValue={rating}
        precision={ratings > 0.1 && ratings < 1 ? 0.5 : 0.1}
        size="small"
        readOnly
        emptyIcon={
          <StarBorderIcon fontSize="small" className="text-amber-400" />
        }
      />
    </div>
  );
};

export default Rating;
