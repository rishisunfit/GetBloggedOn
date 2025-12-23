import Image from "@tiptap/extension-image";
import { NodeSelection } from "prosemirror-state";

export const ImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: (element) => element.getAttribute("width"),
                renderHTML: (attributes) => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: null,
                parseHTML: (element) => element.getAttribute("height"),
                renderHTML: (attributes) => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
            },
            align: {
                default: "center",
                parseHTML: (element) => {
                    const align = element.getAttribute("data-align") || element.style.textAlign;
                    return align || "center";
                },
                renderHTML: (attributes) => {
                    if (!attributes.align || attributes.align === "center") {
                        return {
                            "data-align": "center",
                            style: "display: block; margin-left: auto; margin-right: auto;",
                        };
                    }
                    if (attributes.align === "left") {
                        return {
                            "data-align": "left",
                            style: "display: block; margin-left: 0; margin-right: auto;",
                        };
                    }
                    if (attributes.align === "right") {
                        return {
                            "data-align": "right",
                            style: "display: block; margin-left: auto; margin-right: 0;",
                        };
                    }
                    return {};
                },
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlign:
                (align: "left" | "center" | "right") =>
                    ({ commands }: { commands: any }) => {
                        return commands.updateAttributes(this.name, { align });
                    },
            setImageSize:
                (width: string | number, height?: string | number) =>
                    ({ commands }: { commands: any }) => {
                        return commands.updateAttributes(this.name, {
                            width: typeof width === "number" ? `${width}px` : width,
                            height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
                        });
                    },
        };
    },

    addNodeView() {
        return ({ node, HTMLAttributes, getPos, editor }) => {
            const dom = document.createElement("div");
            dom.className = "image-wrapper";

            const inner = document.createElement("div");
            inner.className = "image-inner group";

            const img = document.createElement("img");
            Object.entries(HTMLAttributes).forEach(([key, value]) => {
                if (key === "class") {
                    img.className = value as string;
                } else if (value !== null && value !== undefined) {
                    img.setAttribute(key, value as string);
                }
            });

            // Set width and height if provided
            if (node.attrs.width) {
                img.style.width = typeof node.attrs.width === "number"
                    ? `${node.attrs.width}px`
                    : node.attrs.width;
            }
            if (node.attrs.height) {
                img.style.height = typeof node.attrs.height === "number"
                    ? `${node.attrs.height}px`
                    : node.attrs.height;
            }

            // Apply alignment (aligns the inner container inside a full-width wrapper)
            const align = node.attrs.align || "center";
            dom.setAttribute("data-align", align);
            dom.style.textAlign = align === "left" ? "left" : align === "right" ? "right" : "center";

            // Make image selectable (NodeSelection) so BubbleMenu positions correctly
            const selectThisImage = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const pos = getPos();
                if (typeof pos === "number") {
                    // Create a transaction with NodeSelection
                    const { state, view } = editor;
                    const { tr } = state;
                    const nodeSelection = NodeSelection.create(tr.doc, pos);
                    tr.setSelection(nodeSelection);
                    view.dispatch(tr);
                    view.focus();
                }
            };
            img.addEventListener("click", selectThisImage);
            inner.addEventListener("click", selectThisImage);

            // Add resize handles
            const resizeHandle = document.createElement("div");
            resizeHandle.className = "resize-handle";
            resizeHandle.contentEditable = "false";

            let isResizing = false;
            let startX = 0;
            let startY = 0;
            let startWidth = 0;
            let startHeight = 0;

            resizeHandle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = img.offsetWidth;
                startHeight = img.offsetHeight;

                const onMouseMove = (e: MouseEvent) => {
                    if (!isResizing) return;

                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    // Maintain aspect ratio
                    const aspectRatio = startWidth / startHeight;
                    const newWidth = Math.max(100, startWidth + deltaX);
                    const newHeight = newWidth / aspectRatio;

                    img.style.width = `${newWidth}px`;
                    img.style.height = `${newHeight}px`;

                    // Update the node attributes
                    const pos = getPos();
                    if (typeof pos === "number") {
                        editor.commands.command(({ tr }) => {
                            const node = tr.doc.nodeAt(pos);
                            if (node) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    width: `${newWidth}px`,
                                    height: `${newHeight}px`,
                                });
                            }
                            return true;
                        });
                    }
                };

                const onMouseUp = () => {
                    isResizing = false;
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            inner.appendChild(img);
            inner.appendChild(resizeHandle);
            dom.appendChild(inner);

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== this.name) {
                        return false;
                    }

                    // Update image attributes
                    if (updatedNode.attrs.width) {
                        img.style.width = typeof updatedNode.attrs.width === "number"
                            ? `${updatedNode.attrs.width}px`
                            : updatedNode.attrs.width;
                    } else {
                        img.style.width = "";
                    }

                    if (updatedNode.attrs.height) {
                        img.style.height = typeof updatedNode.attrs.height === "number"
                            ? `${updatedNode.attrs.height}px`
                            : updatedNode.attrs.height;
                    } else {
                        img.style.height = "";
                    }

                    // Update alignment (wrapper text-align)
                    const align = updatedNode.attrs.align || "center";
                    dom.setAttribute("data-align", align);
                    dom.style.textAlign = align === "left" ? "left" : align === "right" ? "right" : "center";

                    return true;
                },
            };
        };
    },
}).configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
        class: "max-w-full h-auto rounded-lg my-4 cursor-pointer",
    },
});

