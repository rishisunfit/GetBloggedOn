import { Node } from "@tiptap/core";
import { NodeSelection } from "prosemirror-state";

export interface VideoOptions {
    HTMLAttributes: Record<string, any>;
    inline: boolean;
    allowBase64: boolean;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        video: {
            /**
             * Insert a video
             */
            setVideo: (options: {
                src: string;
                align?: "left" | "center" | "right";
                width?: number;
                height?: number;
            }) => ReturnType;
            /**
             * Set video alignment
             */
            setVideoAlign: (align: "left" | "center" | "right") => ReturnType;
        };
    }
}

// Helper function to detect video type from URL
function getVideoType(url: string): "youtube" | "vimeo" | "direct" {
    // Check for YouTube (including Cloudflare links that point to YouTube)
    if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("watch?v=")) {
        return "youtube";
    }
    // Check for Vimeo
    if (url.includes("vimeo.com")) {
        return "vimeo";
    }
    return "direct";
}

// Helper function to extract YouTube video ID
// Handles standard YouTube URLs and Cloudflare-proxied URLs
function getYouTubeId(url: string): string | null {
    // Try multiple patterns to extract YouTube video ID
    // Pattern 1: Standard YouTube URLs (youtube.com/watch?v=VIDEO_ID)
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^#&?\/\s]{11})/);
    if (match && match[1]) {
        return match[1];
    }

    // Pattern 2: Cloudflare or other proxy URLs that might have the video ID
    match = url.match(/[?&]v=([^#&?\/\s]{11})/);
    if (match && match[1]) {
        return match[1];
    }

    // Pattern 3: Direct 11-character video ID in URL
    match = url.match(/\/([a-zA-Z0-9_-]{11})(?:[?&#]|$)/);
    if (match && match[1]) {
        return match[1];
    }

    return null;
}

// Helper function to extract Vimeo video ID
function getVimeoId(url: string): string | null {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// Helper function to render embed URL
function getEmbedUrl(url: string): string | null {
    const type = getVideoType(url);
    if (type === "youtube") {
        const videoId = getYouTubeId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } else if (type === "vimeo") {
        const videoId = getVimeoId(url);
        if (videoId) {
            return `https://player.vimeo.com/video/${videoId}`;
        }
    } else if (type === "direct") {
        return url;
    }
    return null;
}


export const VideoExtension = Node.create<VideoOptions>({
    name: "video",

    addOptions() {
        return {
            inline: false,
            allowBase64: false,
            HTMLAttributes: {},
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return "block";
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element) => {
                    const iframe = element.querySelector("iframe");
                    const video = element.querySelector("video");
                    if (iframe) {
                        return iframe.getAttribute("src");
                    }
                    if (video) {
                        return video.getAttribute("src");
                    }
                    return element.getAttribute("data-src") || element.getAttribute("src");
                },
                renderHTML: (attributes) => {
                    if (!attributes.src) {
                        return {};
                    }
                    return {
                        "data-src": attributes.src,
                    };
                },
            },
            align: {
                default: "center",
                parseHTML: (element) => {
                    return element.getAttribute("data-align") || "center";
                },
                renderHTML: (attributes) => {
                    return {
                        "data-align": attributes.align || "center",
                    };
                },
            },
            width: {
                default: null, // Use CSS for responsive sizing (70% of content area)
                parseHTML: (element) => {
                    const iframe = element.querySelector("iframe");
                    const video = element.querySelector("video");
                    if (iframe) {
                        return iframe.getAttribute("width");
                    }
                    if (video) {
                        return video.getAttribute("width");
                    }
                    return element.getAttribute("data-width");
                },
                renderHTML: (attributes) => {
                    // Don't set fixed width - use CSS for responsive sizing
                    return {};
                },
            },
            height: {
                default: null, // Height will be auto-calculated to maintain aspect ratio
                parseHTML: (element) => {
                    const iframe = element.querySelector("iframe");
                    const video = element.querySelector("video");
                    if (iframe) {
                        return iframe.getAttribute("height");
                    }
                    if (video) {
                        return video.getAttribute("height");
                    }
                    return element.getAttribute("data-height");
                },
                renderHTML: (attributes) => {
                    // Don't set fixed height - use CSS for responsive sizing
                    return {};
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="video"]',
            },
            {
                tag: "iframe[src*='youtube.com']",
                getAttrs: (element) => {
                    if (typeof element === "string") return false;
                    const iframe = element as HTMLIFrameElement;
                    return {
                        src: iframe.src,
                        width: iframe.width,
                        height: iframe.height,
                    };
                },
            },
            {
                tag: "iframe[src*='vimeo.com']",
                getAttrs: (element) => {
                    if (typeof element === "string") return false;
                    const iframe = element as HTMLIFrameElement;
                    return {
                        src: iframe.src,
                        width: iframe.width,
                        height: iframe.height,
                    };
                },
            },
            {
                tag: "video",
                getAttrs: (element) => {
                    if (typeof element === "string") return false;
                    const video = element as HTMLVideoElement;
                    return {
                        src: video.src,
                        width: video.width,
                        height: video.height,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const { src, align, width, height } = node.attrs;
        const embedUrl = getEmbedUrl(src || HTMLAttributes.src);

        if (!embedUrl) {
            return ["div", { class: "video-error" }, "Invalid video URL"];
        }

        const videoType = getVideoType(src || HTMLAttributes.src);
        const alignmentStyle = `text-align: ${align || "center"};`;

        const wrapperAttrs = {
            class: "video-wrapper",
            "data-type": "video",
            "data-align": align || "center",
            style: alignmentStyle,
        };

        const innerAttrs = {
            class: "video-inner",
        };

        if (videoType === "youtube" || videoType === "vimeo") {
            return [
                "div",
                wrapperAttrs,
                [
                    "div",
                    innerAttrs,
                    [
                        "iframe",
                        {
                            src: embedUrl,
                            frameborder: "0",
                            allow:
                                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                            allowfullscreen: "true",
                            style: "width: 100%; height: auto; aspect-ratio: 16 / 9;",
                        },
                    ],
                ],
            ];
        } else {
            return [
                "div",
                wrapperAttrs,
                [
                    "div",
                    innerAttrs,
                    [
                        "video",
                        {
                            src: embedUrl,
                            controls: "true",
                            style: "width: 100%; height: auto; aspect-ratio: 16 / 9;",
                        },
                    ],
                ],
            ];
        }
    },

    addNodeView() {
        return ({ node, HTMLAttributes, getPos, editor }) => {
            const { src, align, width, height } = node.attrs;
            const embedUrl = getEmbedUrl(src);

            const wrapper = document.createElement("div");
            wrapper.setAttribute("data-type", "video");
            wrapper.setAttribute("data-align", align || "center");
            wrapper.style.textAlign = align || "center";
            wrapper.style.width = "100%";
            wrapper.className = "video-wrapper";

            const handleClick = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (editor && typeof getPos === "function") {
                    const pos = getPos();
                    if (typeof pos === "number") {
                        const { state, view } = editor;
                        const { tr } = state;
                        const nodeSelection = NodeSelection.create(tr.doc, pos);
                        tr.setSelection(nodeSelection);
                        view.dispatch(tr);
                        view.focus();
                    }
                }
            };

            // Make wrapper clickable but don't prevent iframe clicks from being handled by overlay
            wrapper.addEventListener("click", (e) => {
                // Only handle if click is directly on wrapper, not on children
                if (e.target === wrapper) {
                    handleClick(e);
                }
            });

            if (!embedUrl) {
                const errorDiv = document.createElement("div");
                errorDiv.style.padding = "20px";
                errorDiv.style.border = "2px dashed #ccc";
                errorDiv.style.textAlign = "center";
                errorDiv.style.color = "#666";
                errorDiv.textContent = "Invalid video URL";
                wrapper.appendChild(errorDiv);
                return {
                    dom: wrapper,
                };
            }

            const videoType = getVideoType(src);
            const innerDiv = document.createElement("div");
            innerDiv.className = "video-inner";
            innerDiv.style.display = "inline-block";
            innerDiv.style.position = "relative";
            innerDiv.style.lineHeight = "0";

            if (videoType === "youtube" || videoType === "vimeo") {
                const iframe = document.createElement("iframe");
                // Use a placeholder image URL for YouTube/Vimeo in edit mode to prevent playback
                // We'll use the embed URL with autoplay=0 and controls=0, but also add pointer-events: none
                iframe.src = embedUrl + (embedUrl.includes("?") ? "&" : "?") + "autoplay=0&controls=0";
                iframe.frameBorder = "0";
                iframe.setAttribute(
                    "allow",
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                );
                iframe.allowFullscreen = true;
                // Use responsive sizing - CSS will handle 70% width
                iframe.style.width = "100%";
                iframe.style.height = "auto";
                iframe.style.aspectRatio = "16 / 9";
                // Disable pointer events so clicks go through to the wrapper
                iframe.style.pointerEvents = "none";
                iframe.style.userSelect = "none";
                innerDiv.appendChild(iframe);
            } else {
                const video = document.createElement("video");
                video.src = embedUrl;
                video.controls = true;
                // Use responsive sizing - CSS will handle 70% width
                video.style.width = "100%";
                video.style.height = "auto";
                video.style.aspectRatio = "16 / 9";
                video.textContent = "Your browser does not support the video tag.";
                // Disable pointer events for direct video as well
                video.style.pointerEvents = "none";
                video.style.userSelect = "none";
                innerDiv.appendChild(video);
            }

            // Clicking anywhere on the video container should select the node + show BubbleMenu
            innerDiv.addEventListener("click", handleClick);
            wrapper.appendChild(innerDiv);

            return {
                dom: wrapper,
            };
        };
    },

    addCommands() {
        return {
            setVideo:
                (options: {
                    src: string;
                    align?: "left" | "center" | "right";
                    width?: number;
                    height?: number;
                }) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                src: options.src,
                                align: options.align || "center",
                                width: options.width,
                                height: options.height,
                            },
                        });
                    },
            setVideoAlign:
                (align: "left" | "center" | "right") =>
                    ({ tr, state, dispatch }) => {
                        const { selection } = state;
                        if (selection instanceof NodeSelection && selection.node.type === this.type) {
                            const pos = selection.$anchor.pos;
                            tr.setNodeMarkup(pos, undefined, {
                                ...selection.node.attrs,
                                align,
                            });
                            if (dispatch) {
                                dispatch(tr);
                            }
                            return true;
                        }
                        return false;
                    },
        };
    },
}).configure({
    HTMLAttributes: {
        class: "video-wrapper",
    },
});

