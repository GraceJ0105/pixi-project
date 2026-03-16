import { Sprite, Container, Application } from "pixi.js";
import { TARGET_BACKGROUND_WIDTH, TARGET_BACKGROUND_HEIGHT } from "./constants";

export function fitAsBackground(
  sprite: Sprite,
  containerWidth: number,
  containerHeight: number
): void {
  sprite.anchor.set(0.5);
  const baseWidth = sprite.texture.width || 1;
  const baseHeight = sprite.texture.height || 1;

  // First, scale all sprites to the same target dimensions
  const scaleToTarget = Math.min(
    TARGET_BACKGROUND_WIDTH / baseWidth,
    TARGET_BACKGROUND_HEIGHT / baseHeight
  );

  // Then scale to fit the container proportionally
  const scaleToContainer = Math.min(
    containerWidth / TARGET_BACKGROUND_WIDTH,
    containerHeight / TARGET_BACKGROUND_HEIGHT
  );

  sprite.scale.set(scaleToTarget * scaleToContainer);
  sprite.position.set(containerWidth / 2, containerHeight / 2);
}

export function layoutScene(
  app: Application,
  treeContainer: Container,
  beachContainer: Container,
  arcticContainer: Container,
  treeSprite: Sprite,
  beachSprite: Sprite,
  arcticSprite: Sprite
): void {
  const width = app.screen.width;
  const height = app.screen.height;
  const thirdWidth = width / 3;
  const thirdHeight = height / 3;

  // Position containers side by side in the middle third vertically
  treeContainer.position.set(0, thirdHeight);
  beachContainer.position.set(thirdWidth, thirdHeight);
  arcticContainer.position.set(thirdWidth * 2, thirdHeight);

  // Fit background sprites to their containers (middle third height)
  fitAsBackground(treeSprite, thirdWidth, thirdHeight);
  fitAsBackground(beachSprite, thirdWidth, thirdHeight);
  fitAsBackground(arcticSprite, thirdWidth, thirdHeight);
}
