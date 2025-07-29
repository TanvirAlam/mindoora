import { UserWrapper } from "../comWrapper";
import Image from "next/image";
import { Styled } from "./TrendingCategories.styled";
import { Categories } from "../../createGames/category.data";

const TrendingCategories = () => {
  return (
    <UserWrapper
      title={"Trending Categories"}
      child={
        <div className="container relative mx-auto mt-8 pr-4">
          <div className="xl:shadow-small-blue mx-auto flex h-[500px] flex-wrap justify-center overflow-auto md:w-5/6">
            {Categories.slice(1).map((category) => (
              <Styled.CategoryWrapper
                key={category.id}
                href={`/portals?category=${category.Label}`}
                className="flex w-1/2 justify-center py-5 text-center lg:w-1/4"
                data-text={category.Label}
              >
                <div className="flex h-[150px] flex-col items-center justify-between">
                  <Image
                    src={category?.img}
                    alt={category?.Label}
                    width={100}
                    height={100}
                  />
                  <span>{category.Label}</span>
                </div>
              </Styled.CategoryWrapper>
            ))}
          </div>
        </div>
      }
    ></UserWrapper>
  );
};

export default TrendingCategories;
