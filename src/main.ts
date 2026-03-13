import { Application, Assets, AnimatedSprite, Container } from "pixi.js";
import { initDevtools } from "@pixi/devtools";
import type { AnimalEnum } from "./types";
import { setupHabitats } from "./habitats";
import { layoutScene } from "./layout";
import { createAnimatedSprite, scaleAnimatedSprite } from "./spriteUtils";
import { createDragHandlers, type GameState } from "./gameLogic";

(async () => {
  const app = new Application();

  const manifest = await (await fetch("/manifest.json")).json();
  await Assets.init({ manifest });

  await app.init({
    resizeTo: window,
    backgroundAlpha: 1,
    backgroundColor: 0x050a1a,
  });

  app.canvas.style.position = "absolute";

  // Setup habitats
  const habitats = await setupHabitats();
  app.stage.addChild(habitats.treeContainer);
  app.stage.addChild(habitats.beachContainer);
  app.stage.addChild(habitats.arcticContainer);

  // Setup game state
  const spriteToBird = new Map<AnimatedSprite, AnimalEnum>();
  const correctlyPlaced = new Set<AnimatedSprite>();
  const correctHabitats = new Map<AnimalEnum, Container>([
    ["robin", habitats.treeContainer],
    ["puffin", habitats.beachContainer],
    ["penguin", habitats.arcticContainer],
  ]);

  const gameState: GameState = {
    dragTarget: null,
    spriteToBird,
    correctlyPlaced,
    correctHabitats,
    treeContainer: habitats.treeContainer,
    beachContainer: habitats.beachContainer,
    arcticContainer: habitats.arcticContainer,
  };

  // Setup drag handlers
  const { onDragStart, onDragEnd } = createDragHandlers(app, gameState);
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  // Layout function
  const doLayout = () => {
    layoutScene(
      app,
      habitats.treeContainer,
      habitats.beachContainer,
      habitats.arcticContainer,
      habitats.treeSprite,
      habitats.beachSprite,
      habitats.arcticSprite,
    );
  };

  doLayout();
  app.renderer.on("resize", doLayout);

  // Create animated sprites
  const animatedRobin = await createAnimatedSprite("robin", 750, 100, onDragStart);
  const animatedPuffin = await createAnimatedSprite("puffin", 250, 100, onDragStart);
  const animatedPenguin = await createAnimatedSprite("penguin", 500, 100, onDragStart);

  spriteToBird.set(animatedRobin, "robin");
  spriteToBird.set(animatedPuffin, "puffin");
  spriteToBird.set(animatedPenguin, "penguin");

  scaleAnimatedSprite(animatedRobin, app.screen.width, app.screen.height);
  scaleAnimatedSprite(animatedPuffin, app.screen.width, app.screen.height);
  scaleAnimatedSprite(animatedPenguin, app.screen.width, app.screen.height);

  app.stage.addChild(animatedRobin);
  app.stage.addChild(animatedPuffin);
  app.stage.addChild(animatedPenguin);

  initDevtools({ app });

  document.body.appendChild(app.canvas);
})();
