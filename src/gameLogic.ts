import {
  AnimatedSprite,
  Container,
  FederatedPointerEvent,
  Application,
} from "pixi.js";
import type { AnimalEnum } from "./types";

export interface GameState {
  dragTarget: AnimatedSprite | null;
  spriteToBird: Map<AnimatedSprite, AnimalEnum>;
  correctlyPlaced: Set<AnimatedSprite>;
  correctHabitats: Map<AnimalEnum, Container>;
  treeContainer: Container;
  beachContainer: Container;
  arcticContainer: Container;
}

export function createDragHandlers(
  app: Application,
  gameState: GameState
): {
  onDragMove: (event: FederatedPointerEvent) => void;
  onDragStart: (event: Event) => void;
  onDragEnd: (event: FederatedPointerEvent) => void;
} {
  const {
    spriteToBird,
    correctlyPlaced,
    correctHabitats,
    treeContainer,
    beachContainer,
    arcticContainer,
  } = gameState;

  function onDragMove(event: FederatedPointerEvent): void {
    if (gameState.dragTarget) {
      gameState.dragTarget.parent?.toLocal(
        event.global,
        undefined,
        gameState.dragTarget.position
      );
    }
  }

  function onDragStart(event: Event): void {
    const pointerEvent = event as FederatedPointerEvent;
    const target = pointerEvent.currentTarget;
    if (!(target instanceof AnimatedSprite)) return;

    // Temporarily stop animation while dragging for better visual feedback
    if (target.playing) {
      target.stop();
    }
    target.alpha = 0.5;
    gameState.dragTarget = target;
    app.stage.on("pointermove", onDragMove);
  }

  function onDragEnd(event: FederatedPointerEvent): void {
    if (!gameState.dragTarget) return;

    app.stage.off("pointermove", onDragMove);
    gameState.dragTarget.alpha = 1;

    // Check if sprite was dropped in the correct habitat
    const birdType = spriteToBird.get(gameState.dragTarget);
    if (!birdType) {
      gameState.dragTarget = null;
      return;
    }

    const correctHabitat = correctHabitats.get(birdType);
    if (!correctHabitat) {
      gameState.dragTarget = null;
      return;
    }

    // Convert global coordinates to check which container the sprite is over
    const globalPos = event.global;
    const thirdWidth = app.screen.width / 3;
    const thirdHeight = app.screen.height / 3; // middle third of the screen

    // Check each container's bounds (containers are in the middle third vertically)
    const containers = [
      {
        container: treeContainer,
        bounds: {
          x: 0,
          y: thirdHeight,
          width: thirdWidth,
          height: thirdHeight,
        },
      },
      {
        container: beachContainer,
        bounds: {
          x: thirdWidth,
          y: thirdHeight,
          width: thirdWidth,
          height: thirdHeight,
        },
      },
      {
        container: arcticContainer,
        bounds: {
          x: thirdWidth * 2,
          y: thirdHeight,
          width: thirdWidth,
          height: thirdHeight,
        },
      },
    ];

    for (const { container, bounds } of containers) {
      if (
        globalPos.x >= bounds.x &&
        globalPos.x <= bounds.x + bounds.width &&
        globalPos.y >= bounds.y &&
        globalPos.y <= bounds.y + bounds.height
      ) {
        // Sprite is over this container
        if (container === correctHabitat) {
          // Correct habitat! Start/resume animation
          correctlyPlaced.add(gameState.dragTarget);
          gameState.dragTarget.play();

          // Move sprite to the container
          const currentParent = gameState.dragTarget.parent;
          if (currentParent) {
            currentParent.removeChild(gameState.dragTarget);
          }
          container.addChild(gameState.dragTarget);

          // Convert to container's local coordinates
          const localPos = container.toLocal(globalPos);
          gameState.dragTarget.position.set(localPos.x, localPos.y);
        } else {
          // Wrong habitat - stop animation and remove from correctly placed set
          gameState.dragTarget.stop();
          correctlyPlaced.delete(gameState.dragTarget);

          // Move sprite to the wrong container (or keep on stage)
          const currentParent = gameState.dragTarget.parent;
          if (currentParent) {
            currentParent.removeChild(gameState.dragTarget);
          }
          container.addChild(gameState.dragTarget);

          // Convert to container's local coordinates
          const localPos = container.toLocal(globalPos);
          gameState.dragTarget.position.set(localPos.x, localPos.y);
        }
        break;
      }
    }

    gameState.dragTarget = null;
  }

  return { onDragMove, onDragStart, onDragEnd };
}
