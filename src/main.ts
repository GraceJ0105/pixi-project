import {
  Application,
  Sprite,
  Assets,
  Container,
  AnimatedSprite,
  Texture,
  FederatedPointerEvent,
} from "pixi.js";
import { initDevtools } from "@pixi/devtools";

export type AnimalEnum = "robin" | "puffin" | "penguin";

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

  const treeContainer = new Container();

  const beachContainer = new Container();

  const arcticContainer = new Container();


  app.stage.addChild(treeContainer);
  app.stage.addChild(beachContainer);
  app.stage.addChild(arcticContainer);

  

  const sceneBundle = await Assets.loadBundle("scene");

  const treeSprite = new Sprite(sceneBundle.tree);
  treeContainer.addChildAt(treeSprite, 0);

  const beachSprite = new Sprite(sceneBundle.beach);
  beachContainer.addChildAt(beachSprite, 0);

  const arcticSprite = new Sprite(sceneBundle.arctic);
  arcticContainer.addChildAt(arcticSprite, 0);

  // Set a consistent target size for all background images (in pixels)
  // All backgrounds will be scaled to this size, then fit to their container
  const TARGET_BACKGROUND_WIDTH = 800;
  const TARGET_BACKGROUND_HEIGHT = 600;

  // Set a consistent target size for all animated sprites (in pixels)
  // All animated sprites will be scaled to this size, then scaled with window
  const TARGET_SPRITE_SIZE = 150; // width and height (square sprites)

  function fitAsBackground(sprite: Sprite, containerWidth: number, containerHeight: number) {
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

  // Position animated sprites in a horizontal line, evenly spaced
  let animatedRobin: AnimatedSprite | undefined;
  let animatedPuffin: AnimatedSprite | undefined;
  let animatedPenguin: AnimatedSprite | undefined;
  
  // Store base scales for animated sprites (since baseScale doesn't exist on AnimatedSprite)
  const spriteBaseScales = new Map<AnimatedSprite, number>();
  
  function layoutScene() {
    const width = app.screen.width;
    const height = app.screen.height;
    const thirdWidth = width / 3;

    // Position containers side by side, each taking 1/3 of the window
    treeContainer.position.set(0, 0);
    beachContainer.position.set(thirdWidth, 0);
    arcticContainer.position.set(thirdWidth * 2, 0);

    // Fit background sprites to their containers
    fitAsBackground(treeSprite, thirdWidth, height);
    fitAsBackground(beachSprite, thirdWidth, height);
    fitAsBackground(arcticSprite, thirdWidth, height);
  }

  layoutScene();
  app.renderer.on("resize", layoutScene);
  // Create object to store sprite sheet data


  // Use Vite's base URL so asset paths still work if the app is hosted under a subpath.
  const baseUrl = import.meta.env.BASE_URL;

  async function createAnimatedSprite(
    birdName: AnimalEnum,
    x: number,
    y: number,
  ): Promise<AnimatedSprite> {
    const framePaths: string[] = [];
    for (let i = 1; i < 6; i += 1) {
      framePaths.push(`${baseUrl}animations/sprites/${birdName}/${birdName}_${i}.png`);
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
    
    animatedSprite.play();

    animatedSprite.eventMode = "static";
    animatedSprite.cursor = "pointer";
    animatedSprite.on("pointerdown", onDragStart);

    return animatedSprite;
  }

  function scaleAnimatedSprite(sprite: AnimatedSprite, windowWidth: number, windowHeight: number) {
    const baseScale = spriteBaseScales.get(sprite);
    if (!baseScale) return;
    
    // Scale based on window size (use a reference window size for consistency)
    const REFERENCE_WINDOW_WIDTH = 1920;
    const REFERENCE_WINDOW_HEIGHT = 1080;
    
    const windowScale = Math.min(
      windowWidth / REFERENCE_WINDOW_WIDTH,
      windowHeight / REFERENCE_WINDOW_HEIGHT
    );
    
    sprite.scale.set(baseScale * windowScale);
  }

  let dragTarget: AnimatedSprite | null = null;

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  function onDragMove(event: FederatedPointerEvent) {
    if (dragTarget) {
      dragTarget.parent?.toLocal(event.global, undefined, dragTarget.position);
    }
  }

  function onDragStart(event: FederatedPointerEvent) {
    const target = event.currentTarget;
    if (!(target instanceof AnimatedSprite)) return;

    target.alpha = 0.5;
    dragTarget = target;
    app.stage.on("pointermove", onDragMove);
  }

  function onDragEnd() {
    if (dragTarget) {
      app.stage.off("pointermove", onDragMove);
      dragTarget.alpha = 1;
      dragTarget = null;
    }
  }

  // Create animated sprites - positions will be set by layoutScene
  animatedRobin = await createAnimatedSprite("robin", 750, 100);
  animatedPuffin = await createAnimatedSprite("puffin", 250, 100);
  animatedPenguin = await createAnimatedSprite("penguin", 500, 100);

  scaleAnimatedSprite(animatedRobin, app.screen.width, app.screen.height);
  scaleAnimatedSprite(animatedPuffin, app.screen.width, app.screen.height);
  scaleAnimatedSprite(animatedPenguin, app.screen.width, app.screen.height);

  app.stage.addChild(animatedRobin);
  app.stage.addChild(animatedPuffin);
  app.stage.addChild(animatedPenguin);
  
  // Position sprites now that they're created
  layoutScene();

  initDevtools({ app });

  document.body.appendChild(app.canvas);
})();
