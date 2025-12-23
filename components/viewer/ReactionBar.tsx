import { useState } from 'react';

interface StarRating {
  stars: number;
  count: number;
}

const StarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
    />
  </svg>
);

export function ReactionBar() {
  const [ratings, setRatings] = useState<StarRating[]>([
    { stars: 3, count: 1153 },
    { stars: 2, count: 145 },
    { stars: 1, count: 35 },
  ]);

  const handleRating = (index: number) => {
    setRatings((prev) =>
      prev.map((rating, i) =>
        i === index ? { ...rating, count: rating.count + 1 } : rating
      )
    );
  };

  return (
    <div className="border-t border-gray-200 pt-8 mt-12">
      <div className="bg-gray-50 rounded-2xl p-8">
        <p className="text-gray-600 mb-6 text-center">How was this essay?</p>
        <div className="flex gap-4 justify-center">
          {ratings.map((rating, index) => (
            <button
              key={index}
              onClick={() => handleRating(index)}
              className="flex flex-col items-center gap-2 px-6 py-4 bg-white hover:bg-gray-50 rounded-lg transition-colors flex-1"
            >
              <div className="flex gap-1">
                {Array.from({ length: rating.stars }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-6 h-6 text-gray-600"
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {rating.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


