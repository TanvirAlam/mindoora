import { styled } from "styled-components";

const TrophyWrapper = styled.div`
  margin: 0 auto;
  padding-right: 10px;
  width: 100%;

  .graph-bar {
    background-color: #7c5aa5;
    -webkit-transition: all 1.5s ease-out;
    -moz-transition: all 1.5s ease-out;
    -o-transition: all 1.5s ease-out;
    transition: all 1.5s ease-out;
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: 10px;
    position: relative;
    z-index: 9999;
    display: flex;
    justify-content: end;
    align-items: center;
    height: 20px;
    width: 0%;
  }
  .graph-bar:hover {
    -webkit-transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    transition: all 0.5s ease;
    background: #dd8e14;

    span {
      font-weight: bold;
      color: #fff;
      font-size: 0.5vi;
    }
  }

  .graph-bar:after {
    position: absolute;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 5px;
    color: #000;
    line-height: 20px;
    height: 20px;
    padding: 0 10px;
    margin-left: 5px;
    left: 100%;
    top: 0;
  }

  .graph-legend {
    position: absolute;
    margin-right: 10px;
    left: 5px;
    color: #fff;
    z-index: 9999;
    font-size: 0.5vi;
    font-weight: 800;
  }

  .graph-points {
    position: relative;
    color: #000;
    margin-left: 5px;

    .graph-points-label {
      font-weight: 800;
      color: #7c5aa5;
    }

    .points {
      font-size: 1rem;
      font-weight: 800;
    }
  }
`;

const BarGraph = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  margin-bottom: 50px;
`;

const Graph = styled.ul`
  position: relative;
  list-style-type: none;
  width: calc(100% - 4%);
  left: 4%;
`;

const GraphBarBack = styled.span`
  border-radius: 2px;
  background: #dae5eb;
  margin-bottom: 10px;
  display: block;
`;

export const Styled = {
  TrophyWrapper,
  BarGraph,
  Graph,
  GraphBarBack,
};
