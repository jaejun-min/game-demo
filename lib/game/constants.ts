// Canvas dimensions
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

// Physics
export const GRAVITY = 980; // pixels per second squared
export const FLAP_FORCE = -300; // pixels per second (negative = upward)
export const MAX_DELTA = 50; // milliseconds - clamp delta time to prevent physics explosion
export const MAX_FALL_SPEED = 500; // pixels per second - terminal velocity
export const FLAP_COOLDOWN = 150; // milliseconds - minimum time between flaps

// Plane
export const PLANE_WIDTH = 40;
export const PLANE_HEIGHT = 30;
export const PLANE_START_X = 100;
export const PLANE_START_Y = 300;

// Pipes
export const PIPE_WIDTH = 60;
export const PIPE_GAP_SIZE = 180; // initial gap size in pixels
export const PIPE_SPAWN_INTERVAL = 1.8; // seconds between pipe spawns
export const PIPE_SCROLL_SPEED = 150; // initial pixels per second

// Difficulty
export const MAX_SPEED = 350; // max scroll speed in pixels per second
export const MIN_GAP = 120; // minimum gap size in pixels
export const SPEED_INCREASE_RATE = 5; // pixels per second per second of elapsed time
export const GAP_DECREASE_RATE = 1.5; // pixels per score point

// Theme
export const THEME_TRANSITION_DURATION = 2; // seconds for color lerp between themes

// Theme score thresholds
export const THEME_SUNSET_SCORE = 10;
export const THEME_NIGHT_SCORE = 25;
export const THEME_SPACE_SCORE = 50;
