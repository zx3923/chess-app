"use client";

import { socket } from "@/lib/socket";
// import { useChess } from "@/lib/context/ChessContext";
import { useState } from "react";

interface ToggleSwitchProps {
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ToggleSwitch({
  isOn = false,
  onToggle,
  label,
  disabled = false,
  size = "md",
}: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(isOn);
  // const { game } = useChess();

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isChecked;
    setIsChecked(newState);
    onToggle?.(newState);
    if (label === "평가 막대") {
      // game.setShowWinBar(newState);
      socket.emit("barChange", newState);
    } else if (label === "수 보이기") {
      socket.emit("bestMoveChange", newState);
      // game.setShowBestMoves(newState);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: {
      switch: "w-8 h-4",
      circle: "w-3 h-3",
      translate: "translate-x-4",
      label: "text-sm",
    },
    md: {
      switch: "w-11 h-6",
      circle: "w-5 h-5",
      translate: "translate-x-5",
      label: "text-base",
    },
    lg: {
      switch: "w-14 h-7",
      circle: "w-6 h-6",
      translate: "translate-x-7",
      label: "text-lg",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center">
      {label && (
        <label
          htmlFor="toggle-switch"
          className={`mr-3 ${currentSize.label} ${
            disabled ? "text-gray-500" : "text-white"
          }`}
        >
          {label}
        </label>
      )}
      <button
        id="toggle-switch"
        role="switch"
        aria-checked={isChecked}
        aria-label={label || "Toggle"}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex ${
          currentSize.switch
        } flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : isChecked
            ? "bg-green-500"
            : "bg-neutral-700"
        }`}
      >
        <span className="sr-only">{label || "Toggle"}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block ${
            currentSize.circle
          } rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isChecked ? currentSize.translate : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
