import { styled } from "styled-components";

const PricingSection = styled.div`
  gap: 32px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 4rem;
  }

  .pricing-card {
    --col: #e4e4e7;
    position: relative;
    max-width: 400px;
    padding: 32px;
    padding-bottom: 96px;
    border-radius: 4px;
    border: 1px solid #262626;
    background-color: #26262620;
    box-shadow: 0 0 32px transparent;
    text-align: center;
  }

  .pricing-card.basic {
    --col: #0891b2;
  }

  .pricing-card.standard {
    --col: #059669;
  }

  .pricing-card.premium {
    --col: #c026d3;
  }

  .pricing-card:hover {
    border: none;
    background-color: #26262680;
    box-shadow: 0 0 32px #171717;
    transform: translateY(-16px) scale(1.02);
    transition: all 0.5s ease;
  }

  .pricing-card > *:not(:last-child) {
    margin-bottom: 32px;
  }

  .pricing-card .heading h4 {
    padding-bottom: 12px;
    color: var(--col);
    font-size: 24px;
    font-weight: normal;
    text-transform: uppercase;
    font-weight: bold;
  }

  .pricing-card .heading p {
    color: #1d1c1c;
    font-size: 14px;
    font-weight: bold;
  }

  .pricing-card .price {
    position: relative;
    color: var(--col);
    font-size: 60px;
    font-weight: bold;
  }

  .pricing-card .price sub {
    position: absolute;
    bottom: 14px;
    color: #261313;
    font-size: 14px;
    font-weight: lighter;
  }

  .pricing-card .features li {
    padding-bottom: 16px;
    color: #261313;
    font-size: 16px;
    font-weight: lighter;
    text-align: left;
  }

  .pricing-card .features li i,
  .pricing-card .features li strong {
    color: #4d297b;
    font-size: 16px;
    text-align: left;
    font-weight: 700;
  }

  .pricing-card .features li strong {
    padding-left: 24px;
  }

  .pricing-card .features li span {
    padding-left: 50px;
    font-size: 0.9rem;
    text-wrap: wrap;
    color: #000;
  }

  .pricing-card .cta-btn {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--col);
    background-color: var(--col);
    color: #e4e4e7;
    font-size: 20px;
    font-weight: bold;
  }

  .pricing-card .cta-btn:active {
    background-color: transparent;
    color: var(--col);
    transition: all 0.3s ease;
  }
`;

export const Styled = {
  PricingSection,
};
