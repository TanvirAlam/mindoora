import React, { useEffect } from "react";
import { Styled } from "./Account.styled";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";

const Account = () => {
  useEffect(() => {
    const planBtns = document.querySelectorAll(".card-btn-parent button");
    const plans = document.querySelectorAll(".card-body > div");

    function handleClick(event) {
      removeClass();
      event.target.classList.add("active");
      const btnVal = event.target.getAttribute("id");
      const btnId = "#card-" + btnVal;
      document.querySelector(btnId).classList.add("active");
    }

    function removeClass() {
      planBtns.forEach((planBtn) => {
        if (planBtn.classList.contains("active")) {
          planBtn.classList.remove("active");
        }
      });
      plans.forEach((plan) => {
        if (plan.classList.contains("active")) {
          plan.classList.remove("active");
        }
      });
    }

    planBtns.forEach((planBtn) => {
      planBtn.addEventListener("click", handleClick);
    });

    return () => {
      planBtns.forEach((planBtn) => {
        planBtn.removeEventListener("click", handleClick);
      });
    };
  }, []);

  return (
    <Styled.PricingCard>
      <div className="card-header">
        <div className="card-btn-parent">
          <button id="basic-plan" className="active">
            Basic
          </button>
          <button id="standard-plan">Standard</button>
          <button id="premium-plan">Premium</button>
          <div className="overlay"></div>
        </div>
      </div>
      <div className="card-body">
        <div id="card-basic-plan" className="active">
          <div className="card-plans">
            <span className="plan-tag">Basic</span>
            <div className="card-plan">
              <h3 className="plan-title">Icon Sets</h3>
              <h3 className="plan-price">$600000</h3>
            </div>
          </div>
          <div className="card-content">
            <p>
              Up to 50 creative & professional icons + one color versions/themes
            </p>
            <div className="card-lists">
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/tick.svg"
                  alt=""
                />
                Included source files
              </div>
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/wrong.svg"
                  alt=""
                />
                Converted to responsive components
              </div>
            </div>
          </div>
          <div className="card-button">
            <GenericButton
              backgroundcolor="#FF4F40"
              textcolor="#fff"
              variant="shadow"
              activebgcolor="#FF6F50"
              isdisabled={false}
              shape="10px"
              shadowcolor="#888"
              size="medium"
            >
              PAY
            </GenericButton>
          </div>
        </div>
        <div id="card-standard-plan">
          <div className="card-plans">
            <span className="plan-tag">Standard</span>
            <div className="card-plan">
              <h3 className="plan-title">Icon Sets</h3>
              <h3 className="plan-price">$120</h3>
            </div>
          </div>
          <div className="card-content">
            <p>
              Up to 100 creative & professional icons + two color
              versions/themes per month
            </p>
            <div className="card-lists">
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/tick.svg"
                  alt=""
                />
                Included source files
              </div>
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/tick.svg"
                  alt=""
                />
                Converted to responsive components
              </div>
            </div>
          </div>
          <div className="card-button">
            <GenericButton
              backgroundcolor="#FF4F40"
              textcolor="#fff"
              variant="shadow"
              activebgcolor="#FF6F50"
              isdisabled={false}
              shape="10px"
              shadowcolor="#888"
              size="medium"
            >
              PAY
            </GenericButton>
          </div>
        </div>
        <div id="card-premium-plan">
          <div className="card-plans">
            <span className="plan-tag">Premium</span>
            <div className="card-plan">
              <h3 className="plan-title">Icon Sets</h3>
              <h3 className="plan-price">$180</h3>
            </div>
          </div>
          <div className="card-content">
            <p>
              Up to 200 creative & professional icons + four color
              versions/themes
            </p>
            <div className="card-lists">
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/tick.svg"
                  alt=""
                />
                Included source files
              </div>
              <div className="card-list">
                <img
                  src="https://rvs-pricing-card.vercel.app/tick.svg"
                  alt=""
                />
                Converted to responsive components
              </div>
            </div>
          </div>
          <div className="card-button">
            <GenericButton
              backgroundcolor="#FF4F40"
              textcolor="#fff"
              variant="shadow"
              activebgcolor="#FF6F50"
              isdisabled={false}
              shape="10px"
              shadowcolor="#888"
              size="medium"
            >
              PAY
            </GenericButton>
          </div>
        </div>
      </div>
    </Styled.PricingCard>
  );
};

export default Account;
