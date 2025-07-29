import React from "react";
import { Styled } from "./AboutUsPage.styled";
import Image from "next/image";

export const AboutUsPage = () => {
  return (
    <Styled.AboutPageWrapper>
      <div className="responsive-container-block bigContainer">
        <div className="responsive-container-block Container">
          <div className="imgContainer">
            <Image
              src={"/assets/mindoora.png"}
              width={200}
              height={200}
              alt="mindoora-logo"
            />
            <Image
              src="/assets/aboutus/aboutpage.png"
              alt="aboutus"
              width={500}
              height={500}
            />
          </div>
          <div className="responsive-container-block textSide">
            <p className="text-blk heading">About Us</p>
            <p className="text-blk subHeading">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eget
              purus lectus viverra in semper nec pretium mus. Lorem ipsum dolor
              sit amet, consectetur adipiscing elit. Eget purus lectus viverra
              in semper nec pretium mus. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Eget purus lectus viverra in semper nec pretium
              mus.
            </p>
            <div className="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
              <div className="cardImgContainer">
                <Image
                  src="/assets/aboutus/value1.png"
                  alt="value1"
                  width={100}
                  height={100}
                  className="cardImg"
                />
              </div>
              <div className="cardText">
                <p className="text-blk cardHeading">Value</p>
                <p className="text-blk cardSubHeading">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
              <div className="cardImgContainer">
                <Image
                  src="/assets/aboutus/value2.png"
                  alt="value1"
                  width={100}
                  height={100}
                  className="cardImg"
                />
              </div>
              <div className="cardText">
                <p className="text-blk cardHeading">Value</p>
                <p className="text-blk cardSubHeading">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
              <div className="cardImgContainer">
                <Image
                  src="/assets/aboutus/value3.png"
                  alt="value1"
                  width={100}
                  height={100}
                  className="cardImg"
                />
              </div>
              <div className="cardText">
                <p className="text-blk cardHeading">Value</p>
                <p className="text-blk cardSubHeading">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
            <div className="responsive-cell-block wk-desk-6 wk-ipadp-6 wk-tab-12 wk-mobile-12">
              <div className="cardImgContainer">
                <Image
                  src="/assets/aboutus/value4.png"
                  alt="value1"
                  width={100}
                  height={100}
                  className="cardImg"
                />
              </div>
              <div className="cardText">
                <p className="text-blk cardHeading">Value</p>
                <p className="text-blk cardSubHeading">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
          <Image
            src="/assets/aboutus/aboutpageSub.png"
            alt="aboutus"
            width={50}
            height={50}
            className="redDots"
          />
        </div>
      </div>
    </Styled.AboutPageWrapper>
  );
};
