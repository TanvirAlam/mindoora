import React from "react";
import { Styled } from "./Pricing.styled";
import { PricingPlan } from "./PricingData";
import Image from "next/image";

export const PricingFeatures = () => {
  return (
    <Styled.PricingSection>
      {PricingPlan.map((plan) => (
        <div key={plan.id} className={`pricing-card ${plan.header}`}>
          <div className="absolute bottom-0 z-[-5]">
            <Image
              src={plan.image}
              alt="bg"
              width={300}
              height={300}
              className={`opacity-3 transform blur-md ${plan.imageRotate}`}
            />
          </div>
          <div className="heading">
            <h4>{plan.header}</h4>
            <p>{plan.headerDescription}</p>
          </div>
          <p className="price">
            {plan.price}
            <sub>/month</sub>
          </p>
          <ul className="features">
            {plan.pricingFeatures.map((item, index) => (
              <li
                className="flex flex-col items-start justify-center"
                key={index}
              >
                <i className="fa-solid fa-check"></i>
                <strong>{item.feature}</strong>
                <span>{item.featureDesc}</span>
              </li>
            ))}
          </ul>
          <button className="cta-btn">SELECT</button>
        </div>
      ))}
    </Styled.PricingSection>
  );
};
