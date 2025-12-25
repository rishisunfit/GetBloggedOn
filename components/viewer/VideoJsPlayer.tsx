"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import Hls from "hls.js";
import "video.js/dist/video-js.css";
import "videojs-markers";
import "videojs-markers/dist/videojs.markers.css";

import { videoTimestampsApi, type VideoTimestamp } from "@/services/videoTimestamps";

type VideoJsPlayerProps = {
    postId: string;
    videoUrl: string;
    videoId?: string | null;
    primaryColor?: string | null;
    className?: string;
};

export function extractCloudflareVideoIdFromUrl(url: string): { videoId: string | null; customerCode: string | null } {
    if (!url) return { videoId: null, customerCode: null };
    const normalized = url.startsWith("http") ? url : `https://${url.replace(/^\/\//, "")}`;

    let match = normalized.match(/customer-([a-zA-Z0-9]+)\.cloudflarestream\.com\/([a-zA-Z0-9]+)\/iframe/);
    if (match && match[1] && match[2]) {
        return { videoId: match[2], customerCode: match[1] };
    }

    match = normalized.match(/customer-([a-zA-Z0-9]+)\.cloudflarestream\.com\/([a-zA-Z0-9]+)/);
    if (match && match[1] && match[2]) {
        return { videoId: match[2], customerCode: match[1] };
    }

    match = normalized.match(/iframe\.videodelivery\.net\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
        return { videoId: match[1], customerCode: null };
    }

    match = normalized.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
        return { videoId: match[1], customerCode: null };
    }

    match = normalized.match(/watch\.cloudflarestream\.com\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
        return { videoId: match[1], customerCode: null };
    }

    if (/^[a-zA-Z0-9]{16,}$/.test(normalized)) {
        return { videoId: normalized, customerCode: null };
    }

    return { videoId: null, customerCode: null };
}

function convertToHlsManifestUrl(url: string): string | null {
    const { videoId, customerCode } = extractCloudflareVideoIdFromUrl(url);
    if (!videoId) return null;

    if (url.includes(".m3u8")) return url;

    if (customerCode) {
        return `https://customer-${customerCode}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    }
    return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
}

function extractPrimaryColorFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pc = urlObj.searchParams.get("primaryColor");
        if (pc) {
            return pc.startsWith("#") ? pc : `#${pc.replace(/^%23/, "")}`;
        }
        const match = url.match(/primaryColor=([^&]+)/);
        if (match) {
            const color = decodeURIComponent(match[1]);
            return color.startsWith("#") ? color : `#${color.replace(/^%23/, "")}`;
        }
    } catch {
        const match = url.match(/primaryColor=%23([a-fA-F0-9]{6})/);
        if (match) {
            return `#${match[1]}`;
        }
    }
    return null;
}

export function VideoJsPlayer({ postId, videoUrl, videoId: providedVideoId, primaryColor: providedPrimaryColor, className }: VideoJsPlayerProps) {
    const { videoId: extractedVideoId } = extractCloudflareVideoIdFromUrl(videoUrl);
    const resolvedVideoId = providedVideoId || extractedVideoId;
    const extractedPrimaryColor = providedPrimaryColor || extractPrimaryColorFromUrl(videoUrl) || "#3B82F6";
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const markersInitializedRef = useRef(false);

    // Unique ID for this player instance to scope CSS
    const playerId = `videojs-player-${resolvedVideoId || extractedVideoId || Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
        if (!resolvedVideoId) return;
        let ignore = false;
        videoTimestampsApi
            .getPublicByVideoId(resolvedVideoId)
            .then((data) => {
                if (!ignore) {
                    console.log(`Loaded ${data?.length || 0} timestamps:`, data);
                    setTimestamps(data || []);
                }
            })
            .catch((error) => {
                console.error("Error loading timestamps for Video.js player:", error);
            });

        return () => {
            ignore = true;
        };
    }, [postId, resolvedVideoId]);

    useEffect(() => {
        if (!isMounted || !videoRef.current || !videoUrl) {
            return;
        }

        const video = videoRef.current;
        const hlsManifestUrl = convertToHlsManifestUrl(videoUrl);
        console.log("Initializing player with HLS URL:", hlsManifestUrl);

        if (!hlsManifestUrl) {
            console.error("Could not convert URL to HLS manifest");
            return;
        }

        const player = videojs(video, {
            autoplay: false,
            controls: true,
            preload: "metadata",
            fluid: true,
            html5: {
                vhs: {
                    overrideNative: true,
                },
                nativeVideoTracks: false,
                nativeAudioTracks: false,
                nativeTextTracks: false,
            },
        });

        playerRef.current = player;
        console.log("Player initialized");

        if (containerRef.current) {
            containerRef.current.style.setProperty("--vjs-primary-color", extractedPrimaryColor);
            player.ready(() => {
                const controlBar = player.getChild("controlBar");
                if (controlBar) {
                    const playToggle = controlBar.getChild("playToggle");
                    const progressControl = controlBar.getChild("progressControl");

                    if (playToggle) {
                        const playEl = playToggle.el() as HTMLElement;
                        if (playEl) {
                            playEl.style.color = extractedPrimaryColor;
                        }
                    }

                    if (progressControl) {
                        const seekBar = progressControl.getChild("seekBar");
                        if (seekBar) {
                            const loadProgress = seekBar.getChild("loadProgressBar");
                            const playProgress = seekBar.getChild("playProgressBar");
                            if (loadProgress) {
                                const loadEl = loadProgress.el() as HTMLElement;
                                if (loadEl) {
                                    loadEl.style.backgroundColor = extractedPrimaryColor;
                                }
                            }
                            if (playProgress) {
                                const playEl = playProgress.el() as HTMLElement;
                                if (playEl) {
                                    playEl.style.backgroundColor = extractedPrimaryColor;
                                }
                            }
                        }
                    }
                }
            });
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
            });
            hlsRef.current = hls;

            hls.loadSource(hlsManifestUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS manifest loaded successfully");
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("HLS network error, trying to recover...");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("HLS media error, trying to recover...");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("HLS fatal error, cannot recover");
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = hlsManifestUrl;
        } else {
            console.error("HLS is not supported in this browser");
        }

        player.on("error", () => {
            const error = player.error();
            console.error("Video.js player error:", error);
        });

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            player.dispose();
            playerRef.current = null;
            markersInitializedRef.current = false;
        };
    }, [videoUrl, isMounted, extractedPrimaryColor]);

    // Manual marker injection when videojs-markers plugin fails
    useEffect(() => {
        if (!playerRef.current || timestamps.length === 0) {
            return;
        }

        const player = playerRef.current as Player & {
            markers?: (config: any) => void;
        };

        console.log(`Setting up markers with ${timestamps.length} timestamps`);

        const setupMarkers = () => {
            if (markersInitializedRef.current) {
                console.log("Markers already initialized");
                return;
            }

            const duration = player.duration();
            console.log("Duration:", duration);

            if (!duration || !isFinite(duration) || duration === 0) {
                console.log("Duration not ready");
                return;
            }

            // Try the plugin first
            if (typeof (player as any).markers === "function") {
                try {
                    (player as any).markers.removeAll?.();
                } catch (e) {
                    console.warn("Error removing existing markers:", e);
                }

                const markersConfig = {
                    markers: timestamps.map((ts) => ({
                        time: ts.timestamp_seconds,
                        text: ts.label,
                    })),
                    markerStyle: {
                        'width': '14px',
                        'height': '14px',
                        'background-color': extractedPrimaryColor,
                        'border-radius': '50%',
                        'border': '3px solid white',
                        'box-shadow': '0 0 6px rgba(0,0,0,0.8)',
                    },
                    markerTip: {
                        display: true,
                        text: (marker: { time: number; text: string }) => marker.text,
                    },
                    breakOverlay: {
                        display: false,
                    },
                    onMarkerClick: (marker: { time: number }) => {
                        console.log(`Marker clicked at ${marker.time}s`);
                        player.currentTime(marker.time);
                        if (player.paused()) {
                            player.play();
                        }
                    },
                };

                try {
                    (player as any).markers(markersConfig);
                    console.log("✓ Markers plugin called");

                    // Check if markers actually appeared in DOM
                    setTimeout(() => {
                        const markerElements = document.querySelectorAll('.vjs-marker');
                        console.log(`Found ${markerElements.length} marker elements in DOM`);

                        // If plugin failed to create markers, create them manually
                        if (markerElements.length === 0) {
                            console.log("Plugin failed, creating markers manually...");
                            createManualMarkers(player, timestamps, duration, extractedPrimaryColor);
                        }

                        markersInitializedRef.current = true;
                    }, 500);
                } catch (e) {
                    console.error("Error initializing markers:", e);
                    // Fallback to manual creation
                    createManualMarkers(player, timestamps, duration, extractedPrimaryColor);
                    markersInitializedRef.current = true;
                }
            } else {
                console.warn("videojs-markers plugin not available, creating manual markers");
                createManualMarkers(player, timestamps, duration, extractedPrimaryColor);
                markersInitializedRef.current = true;
            }
        };

        const checkAndSetup = () => {
            const readyState = player.readyState();
            const duration = player.duration();

            if (readyState >= 1 && duration && isFinite(duration) && duration > 0) {
                setupMarkers();
            }
        };

        const onLoadedMetadata = () => {
            console.log("loadedmetadata event");
            setTimeout(checkAndSetup, 100);
        };

        const onDurationChange = () => {
            console.log("durationchange event");
            setTimeout(checkAndSetup, 100);
        };

        player.on("loadedmetadata", onLoadedMetadata);
        player.on("durationchange", onDurationChange);

        player.ready(() => {
            console.log("Player ready");
            setTimeout(checkAndSetup, 100);
            setTimeout(checkAndSetup, 500);
            setTimeout(checkAndSetup, 1000);
        });

        return () => {
            player.off("loadedmetadata", onLoadedMetadata);
            player.off("durationchange", onDurationChange);
        };
    }, [timestamps, extractedPrimaryColor]);

    if (!videoUrl || !resolvedVideoId) {
        return null;
    }

    return (
        <div
            id={playerId}
            ref={containerRef}
            className={`mt-12 rounded-xl border border-gray-200 overflow-hidden bg-black ${className ?? ""}`}
            style={{
                "--vjs-primary-color": extractedPrimaryColor,
            } as React.CSSProperties}
        >
            <div data-vjs-player>
                <video
                    ref={(el) => {
                        videoRef.current = el;
                        if (el && el.isConnected) {
                            setIsMounted(true);
                        }
                    }}
                    className="video-js vjs-big-play-centered vjs-default-skin"
                    playsInline
                    data-setup="{}"
                />
            </div>
            <style jsx global>{`
                #${playerId} .video-js .vjs-play-progress,
                #${playerId} .video-js .vjs-load-progress {
                    background-color: ${extractedPrimaryColor} !important;
                }
                #${playerId} .video-js .vjs-play-control:hover,
                #${playerId} .video-js .vjs-play-control:focus {
                    color: ${extractedPrimaryColor} !important;
                }
                #${playerId} .video-js .vjs-big-play-button {
                    border-color: ${extractedPrimaryColor} !important;
                }
                #${playerId} .video-js .vjs-big-play-button:hover {
                    background-color: ${extractedPrimaryColor} !important;
                }
                
                /* Manual marker styles */
                #${playerId} .video-js .vjs-progress-control .vjs-progress-holder .vjs-marker,
                #${playerId} .video-js .vjs-progress-control .vjs-progress-holder .manual-marker {
                    width: 14px !important;
                    height: 14px !important;
                    background-color: ${extractedPrimaryColor} !important;
                    border-radius: 50% !important;
                    border: 3px solid white !important;
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.8) !important;
                    position: absolute !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    cursor: pointer !important;
                    z-index: 100 !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                
                #${playerId} .video-js .vjs-progress-control .vjs-progress-holder .vjs-marker:hover,
                #${playerId} .video-js .vjs-progress-control .vjs-progress-holder .manual-marker:hover {
                    transform: translateY(-50%) scale(1.5) !important;
                    transition: transform 0.2s ease !important;
                    box-shadow: 0 0 12px rgba(0, 0, 0, 1) !important;
                }
                
                #${playerId} .vjs-marker-tip,
                #${playerId} .manual-marker-tip {
                    background-color: rgba(0, 0, 0, 0.95) !important;
                    color: white !important;
                    padding: 6px 12px !important;
                    border-radius: 4px !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    white-space: nowrap !important;
                    pointer-events: none !important;
                    z-index: 1000 !important;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5) !important;
                    display: block !important;
                    position: absolute !important;
                    bottom: calc(100% + 8px) !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                }
                
                #${playerId} .manual-marker:hover .manual-marker-tip {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}

// Manual marker creation function
function createManualMarkers(
    player: Player,
    timestamps: VideoTimestamp[],
    duration: number,
    primaryColor: string
) {
    const controlBar = player.getChild("controlBar");
    if (!controlBar) {
        console.error("Control bar not found");
        return;
    }

    const progressControl = controlBar.getChild("progressControl");
    if (!progressControl) {
        console.error("Progress control not found");
        return;
    }

    const seekBar = progressControl.getChild("seekBar");
    if (!seekBar) {
        console.error("Seek bar not found");
        return;
    }

    // The seekBar element itself is what we need
    const progressHolder = seekBar.el() as HTMLElement;
    if (!progressHolder) {
        console.error("Seek bar element not found");
        return;
    }

    console.log("Progress holder found:", progressHolder);

    // Remove any existing manual markers
    progressHolder.querySelectorAll('.manual-marker').forEach(el => el.remove());

    timestamps.forEach((timestamp) => {
        const marker = document.createElement('div');
        marker.className = 'manual-marker';

        const percentage = (timestamp.timestamp_seconds / duration) * 100;
        marker.style.left = `${percentage}%`;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'manual-marker-tip';
        tooltip.textContent = timestamp.label;
        marker.appendChild(tooltip);

        // Click handler
        marker.addEventListener('click', () => {
            player.currentTime(timestamp.timestamp_seconds);
            if (player.paused()) {
                player.play();
            }
        });

        progressHolder.appendChild(marker);
        console.log(`Created manual marker at ${timestamp.timestamp_seconds}s (${percentage}%)`);
    });

    console.log(`✓ Created ${timestamps.length} manual markers`);
}