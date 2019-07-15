import React, {
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState
} from "react";
import range from "lodash/range";
import styled from "styled-components";

const BALL_SIZE = 100;
const DISTANCE_BETWEEN_BALLS = BALL_SIZE + 6;

const Container = styled.div`
  box-sizing: border-box;
  background-color: #7a0116;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
`;

const Count = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  font-size: 24px;
  user-select: none;
`;

const String = styled.div`
  position: absolute;
  top: 0;
  height: 100vh;
  left: 50%;
  width: 4px;
  margin-left: -2px;
  background-color: #000102;
`;

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useMomentum = () => {
  const [data, setData] = useState(null);
  const raf = useRef();

  useEffect(() => {
    if (!data) {
      return;
    }

    cancelAnimationFrame(raf.current);

    raf.current = requestAnimationFrame(() => {
      if (Math.abs(data.velocity) < 0.001) {
        setData(null);
        return;
      }

      const time = new Date().getTime();
      const distance = data.distance + data.velocity * (time - data.lastTime);
      setData({
        ...data,
        velocity: 0.95 * data.velocity,
        lastTime: time,
        distance
      });

      data.callback(distance);
    });
  }, [data]);

  const startMomentum = (vel, callback) => {
    cancelAnimationFrame(raf.current);

    setData({
      velocity: vel,
      lastTime: new Date().getTime(),
      distance: 0,
      callback
    });
  };

  const stopMomentum = () => {
    cancelAnimationFrame(raf.current);
    setData(null);
  };

  return [startMomentum, stopMomentum];
};

const App = () => {
  const [position, setPosition] = useState(0);
  const [touchData, setTouchData] = useState(null);
  const [startMomentum, stopMomentum] = useMomentum();
  const [count, setCount] = useState(0);

  const [height, setHeight] = useState(null);
  const container = useRef();

  useLayoutEffect(() => {
    setHeight(container.current.offsetHeight);
  }, [setHeight]);

  const incrementCount = useCallback(() => {
    setCount(count + 1);
  }, [setCount, count]);

  return (
    <Container
      ref={container}
      onTouchStart={evt => {
        stopMomentum();
        setTouchData({
          startY: evt.touches[0].screenY,
          previousY: null,
          previousTime: null,
          y: evt.touches[0].screenY,
          time: new Date().getTime()
        });
      }}
      onTouchMove={evt => {
        setTouchData({
          ...touchData,
          previousY: touchData.y,
          previousTime: touchData.time,
          y: evt.touches[0].screenY,
          time: new Date().getTime()
        });
      }}
      onTouchEnd={() => {
        const velocity =
          (touchData.y - touchData.previousY) /
          (touchData.time - touchData.previousTime);

        setPosition(position + touchData.y - touchData.startY);
        setTouchData(null);
        startMomentum(velocity, dis => {
          setPosition(position + dis);
        });
      }}
    >
      <Count
        onClick={() => {
          setCount(0);
        }}
      >
        {count}
      </Count>
      <String />
      <Balls
        position={
          touchData ? touchData.y - touchData.startY + position : position
        }
        height={height}
        onIncrementCount={incrementCount}
      />
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
  background-color: #b7672e;
  border-radius: 50%;
`;

const Balls = ({ position = 0, height = 0, onIncrementCount }) => {
  const numBalls = Math.ceil(height / DISTANCE_BETWEEN_BALLS);
  const previousPosition = usePrevious(position);

  useEffect(() => {
    if (
      Math.floor(previousPosition / DISTANCE_BETWEEN_BALLS) !==
      Math.floor(position / DISTANCE_BETWEEN_BALLS)
    ) {
      window.navigator.vibrate(20);
      onIncrementCount();
    }
  }, [position, previousPosition, onIncrementCount]);

  return (
    <BallsContainer style={{ top: position % DISTANCE_BETWEEN_BALLS }}>
      {range(-1, numBalls).map(num => (
        <Ball key={num} style={{ top: num * DISTANCE_BETWEEN_BALLS }} />
      ))}
    </BallsContainer>
  );
};

export default App;
