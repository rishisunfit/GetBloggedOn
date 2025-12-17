import { useState } from 'react';

interface Reaction {
  emoji: string;
  count: number;
}

export function ReactionBar() {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '😍', count: 1153 },
    { emoji: '🔥', count: 145 },
    { emoji: '💡', count: 89 },
    { emoji: '👏', count: 35 },
  ]);

  const handleReaction = (index: number) => {
    setReactions((prev) =>
      prev.map((reaction, i) =>
        i === index ? { ...reaction, count: reaction.count + 1 } : reaction
      )
    );
  };

  return (
    <div className="border-t border-gray-200 pt-8 mt-12">
      <p className="text-gray-600 mb-4">How was this essay?</p>
      <div className="flex gap-4">
        {reactions.map((reaction, index) => (
          <button
            key={index}
            onClick={() => handleReaction(index)}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {reaction.emoji}
            </span>
            <span className="text-lg font-semibold text-gray-700">
              {reaction.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

