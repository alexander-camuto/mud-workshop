import { useEffect } from "react";
import { Direction } from "./common";

const keys = new Map<KeyboardEvent["key"], Direction>([
  ["ArrowUp", "North"],
  ["ArrowRight", "East"],
  ["ArrowDown", "South"],
  ["ArrowLeft", "West"],
]);

export const useKeyboardMovement = (
  move: undefined | ((direction: Direction) => void),
  stopMoving: undefined | (() => void),
) => {
  useEffect(() => {
    if (!move || !stopMoving) return;

    const pressedKeys = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = keys.get(event.key);
      if (direction == null) return;

      event.preventDefault();
      pressedKeys.add(event.key);
      move(direction);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (keys.has(event.key)) {
        event.preventDefault();
        pressedKeys.delete(event.key);

        // Only stop if no movement keys are being pressed
        if (pressedKeys.size === 0) {
          stopMoving();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [move, stopMoving]);
};
