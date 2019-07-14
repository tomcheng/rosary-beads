import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import range from "lodash/range";
import styled from "styled-components";

const BALL_SIZE = 50;
const DISTANCE_BETWEEN_BALLS = 60;

const Container = styled.div`
  box-sizing: border-box;
  background-color: #7a0116;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
`;

const App = () => {
  const [position, setPosition] = useState(0);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [height, setHeight] = useState(null);
  const container = useRef();

  useLayoutEffect(() => {
    setHeight(container.current.offsetHeight);
  }, [setHeight]);

  return (
    <Container
      ref={container}
      onTouchStart={evt => {
        setTouchStartPosition(position);
        setTouchStartY(evt.touches[0].screenY);
      }}
      onTouchMove={evt => {
        setPosition(
          touchStartPosition + (evt.touches[0].screenY - touchStartY)
        );
      }}
      onTouchEnd={() => {
        setTouchStartPosition(null);
        setTouchStartY(null);
      }}
    >
      <Balls position={position} height={height} />
    </Container>
  );
};

const BallsContainer = styled.div`
  position: relative;
`;

const Ball = styled.div`
  position: absolute;
  left: 0;
  margin-left: -${0.5 * BALL_SIZE}px;
  height: ${BALL_SIZE}px;
  width: ${BALL_SIZE}px;
  background-color: #a55833;
  border-radius: 50%;
`;

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const Balls = ({ position = 0, height = 0 }) => {
  const numBalls = Math.ceil(height / DISTANCE_BETWEEN_BALLS);
  const previousPosition = usePrevious(position);

  useEffect(() => {
    if (
      Math.floor(previousPosition / DISTANCE_BETWEEN_BALLS) !==
      Math.floor(position / DISTANCE_BETWEEN_BALLS)
    ) {
      window.navigator.vibrate(20);
    }
  }, [position, previousPosition]);

  return (
    <BallsContainer style={{ top: position % DISTANCE_BETWEEN_BALLS }}>
      {range(-1, numBalls).map(num => (
        <Ball key={num} style={{ top: num * DISTANCE_BETWEEN_BALLS }} />
      ))}
    </BallsContainer>
  );
};

export default App;
