import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onRatingChange,
  size = 20,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="star-selector" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= activeRating;
        return (
          <Star
            key={value}
            size={size}
            className={interactive ? 'star-icon' : ''}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.1s ease',
            }}
            color={isFilled ? '#f59e0b' : '#4b5563'}
            fill={isFilled ? '#f59e0b' : 'transparent'}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};
export default StarRating;
