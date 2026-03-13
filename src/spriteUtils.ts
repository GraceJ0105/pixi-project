import { AnimatedSprite, Assets, Texture } from "pixi.js";
import type { AnimalEnum } from "./types";
import { TARGET_SPRITE_SIZE, BASE_URL, REFERENCE_WINDOW_WIDTH, REFERENCE_WINDOW_HEIGHT } from "./constants";

// Store base scales for animated sprites (since baseScale doesn't exist on AnimatedSprite)
export const spriteBaseScales = new Map<AnimatedSprite, number>();

export async function createAnimatedSprite(
  birdName: AnimalEnum,
  x: number,
  y: number,
  onDragStart: (event: Event) => void,
): Promise<AnimatedSprite> {
  const framePaths: string[] = [];
  for (let i = 1; i < 6; i += 1) {
    framePaths.push(`${BASE_URL}animations/sprites/${birdName}/${birdName}_${i}.png`);
  }
  const textures = (await Assets.load(framePaths)) as Record<string, Texture>;
  const frames = framePaths.map((p) => textures[p]).filter(Boolean);

  if (frames.length === 0) {
    throw new Error(`No frames loaded for ${birdName}`);
  }

  const animatedSprite = new AnimatedSprite(frames);
  animatedSprite.animationSpeed = 0.13;
  animatedSprite.loop = true;
  animatedSprite.anchor.set(0.5);
  animatedSprite.position.set(x, y);
  
  // Store base scale based on first frame's texture size
  // Use max dimension to ensure all sprites normalize to the same visual size
  const firstTexture = frames[0];
  const baseWidth = firstTexture?.width || 1;
  const baseHeight = firstTexture?.height || 1;
  const maxDimension = Math.max(baseWidth, baseHeight);
  spriteBaseScales.set(animatedSprite, TARGET_SPRITE_SIZE / maxDimension);
  
  // Don't play animation initially - sprites start static
  // Animation will start when correctly placed in habitat
  
  animatedSprite.eventMode = "static";
  animatedSprite.cursor = "pointer";
  animatedSprite.on("pointerdown", onDragStart);

  return animatedSprite;
}

export function scaleAnimatedSprite(
  sprite: AnimatedSprite,
  windowWidth: number,
  windowHeight: number,
): void {
  const baseScale = spriteBaseScales.get(sprite);
  if (!baseScale) return;
  
  // Scale based on window size (use a reference window size for consistency)
  const windowScale = Math.min(
    windowWidth / REFERENCE_WINDOW_WIDTH,
    windowHeight / REFERENCE_WINDOW_HEIGHT
  );
  
  sprite.scale.set(baseScale * windowScale);
}

