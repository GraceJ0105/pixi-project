// Set a consistent target size for all background images (in pixels)
// All backgrounds will be scaled to this size, then fit to their container
export const TARGET_BACKGROUND_WIDTH = 800;
export const TARGET_BACKGROUND_HEIGHT = 600;

// Set a consistent target size for all animated sprites (in pixels)
// All animated sprites will be scaled to this size, then scaled with window
export const TARGET_SPRITE_SIZE = 150; // width and height (square sprites)

// Reference window size for consistent scaling
export const REFERENCE_WINDOW_WIDTH = 1920;
export const REFERENCE_WINDOW_HEIGHT = 1080;

// Use Vite's base URL so asset paths still work if the app is hosted under a subpath.
export const BASE_URL = import.meta.env.BASE_URL;

