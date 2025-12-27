import { useState, useEffect } from 'react';
import { getSessionId } from '@/lib/session';

interface StarRating {
  stars: number;
  count: number;
}

const StarIcon = ({ className, filled = false }: { className?: string; filled?: boolean }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
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

interface ReactionBarProps {
  postId?: string;
}

export function ReactionBar({ postId }: ReactionBarProps) {
  const [ratings, setRatings] = useState<StarRating[]>([
    { stars: 5, count: 0 },
    { stars: 3, count: 0 },
    { stars: 1, count: 0 },
  ]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load ratings on mount
  useEffect(() => {
    if (postId) {
      loadRatings();
    } else {
      setLoading(false);
    }
  }, [postId]);

  const loadRatings = async () => {
    if (!postId) return;

    try {
      const response = await fetch(`/api/submit-rating?post_id=${postId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.counts) {
          setRatings([
            { stars: 5, count: data.counts[5] || 0 },
            { stars: 3, count: data.counts[3] || 0 },
            { stars: 1, count: data.counts[1] || 0 },
          ]);
        }
        if (data.userRating) {
          setUserRating(data.userRating);
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (stars: number) => {
    if (!postId) return;

    // Optimistically update UI
    const previousRating = userRating;
    setUserRating(stars);

    // Update counts optimistically
    setRatings((prev) => {
      const newRatings = [...prev];
      // Remove previous rating if exists
      if (previousRating) {
        const prevIndex = newRatings.findIndex(r => r.stars === previousRating);
        if (prevIndex >= 0 && newRatings[prevIndex].count > 0) {
          newRatings[prevIndex] = {
            ...newRatings[prevIndex],
            count: newRatings[prevIndex].count - 1,
          };
        }
      }
      // Add new rating
      const newIndex = newRatings.findIndex(r => r.stars === stars);
      if (newIndex >= 0) {
        newRatings[newIndex] = {
          ...newRatings[newIndex],
          count: newRatings[newIndex].count + 1,
        };
      }
      return newRatings;
    });

    try {
      const response = await fetch('/api/submit-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          stars,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.counts) {
          setRatings([
            { stars: 5, count: data.counts[5] || 0 },
            { stars: 3, count: data.counts[3] || 0 },
            { stars: 1, count: data.counts[1] || 0 },
          ]);
        }
        if (data.rating) {
          setUserRating(data.rating.stars);
        }
      } else {
        // Revert on error
        setUserRating(previousRating);
        loadRatings(); // Reload to get correct state
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Revert on error
      setUserRating(previousRating);
      loadRatings(); // Reload to get correct state
    }
  };

  if (loading) {
    return (
      <div className="border-t border-gray-200 pt-8 mt-12">
        <div className="bg-gray-50 rounded-2xl p-8">
          <p className="text-gray-600 mb-6 text-center">How was this essay?</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
            {[5, 3, 1].map((stars) => (
              <div
                key={stars}
                className="flex flex-col items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-white rounded-lg w-full sm:w-auto sm:flex-1 animate-pulse"
              >
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <StarIcon
                      key={i}
                      filled={false}
                      className="w-6 h-6 text-gray-300"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-300">-</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-8 mt-12">
      <div className="bg-gray-50 rounded-2xl p-8">
        <p className="text-gray-600 mb-6 text-center">How was this essay?</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          {ratings.map((rating) => (
            <button
              key={rating.stars}
              onClick={() => handleRating(rating.stars)}
              disabled={!postId}
              className={`flex flex-col items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors w-full sm:w-auto sm:flex-1 ${userRating === rating.stars
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                } ${!postId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex gap-1">
                {Array.from({ length: rating.stars }).map((_, i) => (
                  <StarIcon
                    key={i}
                    filled={userRating === rating.stars}
                    className={`w-6 h-6 ${userRating === rating.stars
                      ? 'text-blue-600'
                      : 'text-gray-600'
                      }`}
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


