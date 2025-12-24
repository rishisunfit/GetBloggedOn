"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QuizEmbed } from "./QuizEmbed";

/**
 * Renders quiz embeds in preview mode
 * This component scans for quiz divs and replaces them with React components
 */
export function QuizRenderer() {
    useEffect(() => {
        const renderQuizzes = () => {
            // Find all quiz wrapper divs
            const quizWrappers = document.querySelectorAll(
                '.preview-content div[data-type="quiz"]'
            );

            quizWrappers.forEach((wrapper) => {
                // Skip if already rendered
                if (wrapper.getAttribute("data-rendered") === "true") {
                    return;
                }

                const quizId = wrapper.getAttribute("data-quiz-id");
                const align = (wrapper.getAttribute("data-align") ||
                    "center") as "left" | "center" | "right";

                if (!quizId) {
                    return;
                }

                // Mark as rendered
                wrapper.setAttribute("data-rendered", "true");

                // Create a container for the React component
                const container = document.createElement("div");
                container.className = "quiz-react-container";
                wrapper.innerHTML = "";
                wrapper.appendChild(container);

                // Render the QuizEmbed component
                const root = createRoot(container);
                root.render(<QuizEmbed quizId={quizId} align={align} />);
            });
        };

        // Initial render
        renderQuizzes();

        // Re-render when content changes (for dynamic content)
        const observer = new MutationObserver(() => {
            renderQuizzes();
        });

        const previewContent = document.querySelector(".preview-content");
        if (previewContent) {
            observer.observe(previewContent, {
                childList: true,
                subtree: true,
            });
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
}

