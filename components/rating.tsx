import { useEffect, useState } from "react";

interface RatingProps {
  rating: number;
}

const Rating = ({ rating }: RatingProps) => {
  const [displayedRating, setDisplayedRating] = useState(rating);

  useEffect(() => {
    let start = displayedRating;
    let end = rating;
    let duration = 1500; // 애니메이션 지속 시간 (ms)
    let increment = (end - start) / (duration / 16); // 16ms마다 업데이트
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        current = end;
        clearInterval(timer);
      }
      setDisplayedRating(Math.round(current));
    }, 16); // 16ms마다 실행 (약 60FPS)

    return () => clearInterval(timer);
  }, [rating]);

  return <span className="text-gray-500">({displayedRating})</span>;
};

export default Rating;
