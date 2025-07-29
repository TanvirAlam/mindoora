import { Box } from "@mui/material";
import { Styled } from "./userGift.styled";
import Image from "next/image";
import ScrollContainer from "react-indiana-drag-scroll";

const UserGift = () => {
  return (
    <Box className="flex h-full w-full flex-col justify-center text-white xl:pl-2">
      <h2 className="mb-3 mt-2 text-2xl font-medium">Buy Gifts</h2>
      <Styled.Wrapper>
        <ScrollContainer hideScrollbars={false}>
          <Styled.GiftWrapper>
            {Array(3).fill(
              <Styled.GradientBorder>
                <Styled.GiftCard>
                  <div className="relative flex h-20 w-20 items-center justify-between">
                    <Image
                      src="/trophy.png"
                      alt="trophy"
                      fill
                      className="-mb-2 object-contain"
                    />
                  </div>
                  <p>
                    <span className="font-semibold">500 Points</span> <br />{" "}
                    Winner Cup
                  </p>
                  <button className="flex items-center justify-between rounded-md bg-yellow-500 px-2 py-1 text-xs text-black hover:bg-yellow-600">
                    Buy
                  </button>
                </Styled.GiftCard>
              </Styled.GradientBorder>
            )}
          </Styled.GiftWrapper>
        </ScrollContainer>
      </Styled.Wrapper>
    </Box>
  );
};
export default UserGift;
