import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState("right");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [foodsEaten, setFoodsEaten] = useState(0);
  const [specialFood, setSpecialFood] = useState(null);

  const canvasSize = 30;
  const scale = 25;
  const speed = 100;

  const handleNewGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection("right");
    setGameOver(false);
    setScore(0);
    setFoodsEaten(0);
    setSpecialFood(null);
  };

  const moveSnake = () => {
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
      case "up":
        head.y = head.y === 0 ? canvasSize - 1 : head.y - 1;
        break;
      case "down":
        head.y = head.y === canvasSize - 1 ? 0 : head.y + 1;
        break;
      case "left":
        head.x = head.x === 0 ? canvasSize - 1 : head.x - 1;
        break;
      case "right":
        head.x = head.x === canvasSize - 1 ? 0 : head.x + 1;
        break;
      default:
        break;
    }
    setSnake([head, ...snake.slice(0, -1)]);
  };

  const drawSnake = useCallback(
    (context) => {
      context.fillStyle = "green";
      snake.forEach((segment) => {
        context.fillRect(segment.x * scale, segment.y * scale, scale, scale);
      });
    },
    [scale, snake]
  );

  const drawFood = useCallback(
    (context) => {
      context.fillStyle = "red";
      if (foodsEaten % 5 === 4) {
        // Draw special food
        context.fillStyle = "gold";
      }
      context.fillRect(food.x * scale, food.y * scale, scale, scale);
    },
    [food, scale, foodsEaten]
  );

  const drawSpecialFood = useCallback(
    (context) => {
      context.fillStyle = "blue";
      context.fillRect(
        specialFood.x * scale,
        specialFood.y * scale,
        scale,
        scale
      );
    },
    [specialFood, scale]
  );

  const drawGameOver = (context) => {
    context.fillStyle = "black";
    context.font = "40px Arial";
    context.fillText(
      "GAME OVER",
      (canvasSize * scale) / 2 - 100,
      (canvasSize * scale) / 2
    );

    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText(
      "Press the button to start a new game",
      (canvasSize * scale) / 2 - 200,
      (canvasSize * scale) / 2 + 50
    );
  };

  const checkCollision = () => {
    const head = snake[0];
    if (
      head.x < 0 ||
      head.x >= canvasSize ||
      head.y < 0 ||
      head.y >= canvasSize ||
      snake.some(
        (segment, index) =>
          index !== 0 && segment.x === head.x && segment.y === head.y
      )
    ) {
      setGameOver(true);
    } else if (head.x === food.x && head.y === food.y) {
      setFood(generateFoodPosition());
      setSnake((prevSnake) => [...prevSnake, {}]);

      const newFoodsEaten = foodsEaten + 1;
      setFoodsEaten(newFoodsEaten);

      if (newFoodsEaten % 5 === 0 && newFoodsEaten !== 0) {
        setScore((prevScore) => prevScore + getSpecialFoodScore());
      } else {
        setScore((prevScore) => prevScore + 10);
      }
    }
  };

  useEffect(() => {
    const gameLoop = (context) => {
      context.clearRect(0, 0, canvasSize * scale, canvasSize * scale);
      if (gameOver) {
        drawGameOver(context);
        return;
      }
      moveSnake();
      drawSnake(context);
      drawFood(context);
      if (specialFood) {
        drawSpecialFood(context);
      }
      checkCollision();
    };

    const context = canvasRef.current.getContext("2d");
    const timer = setInterval(() => gameLoop(context), speed);

    const handleKeyPress = (event) => {
      const key = event.key;
      if (key === "ArrowUp" && direction !== "down") {
        setDirection("up");
      } else if (key === "ArrowDown" && direction !== "up") {
        setDirection("down");
      } else if (key === "ArrowLeft" && direction !== "right") {
        setDirection("left");
      } else if (key === "ArrowRight" && direction !== "left") {
        setDirection("right");
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      clearInterval(timer);
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  const generateFoodPosition = useCallback(() => {
    const isColliding = (x, y) => {
      return snake.some((segment) => segment.x === x && segment.y === y);
    };

    let newFoodPosition;
    do {
      const x = Math.floor(Math.random() * canvasSize);
      const y = Math.floor(Math.random() * canvasSize);
      newFoodPosition = { x, y };
    } while (isColliding(newFoodPosition.x, newFoodPosition.y));

    return newFoodPosition;
  }, [canvasSize, snake]);

  const getSpecialFoodScore = useCallback(() => {
    return Math.floor(Math.random() * 4 + 2) * 10;
  }, []);

  return (
    <div className="container">
      <div className="score">Score: {score}</div>
      <div className="flex">
        <canvas
          ref={canvasRef}
          width={canvasSize * scale}
          height={canvasSize * scale}
          className={`canvas ${gameOver ? "game-over" : ""}`}></canvas>
        <div className="button">
          {" "}
          {gameOver ? (
            <button className="normal" onClick={handleNewGame}>
              Start Game
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
