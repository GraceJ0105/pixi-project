import {
  Application,
  Graphics,
  Text,
  TextStyle,
  Sprite,
  Assets,
  Container,
  Spritesheet,
  AnimatedSprite,
  Texture,
} from "pixi.js";
import { initDevtools } from "@pixi/devtools";

export type AnimalEnum = "robin" | "puffin";
type Position = { x: number; y: number };

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
  treeContainer.position.set(0, 0);

  const beachContainer = new Container();
  beachContainer.position.set(app.screen.width / 2, 0);

  app.stage.addChild(treeContainer);
  app.stage.addChild(beachContainer);

  // const birdsBundle = await Assets.loadBundle("birds");

  // const halfWidth = () => app.screen.width / 2;

  // for (let i = 0; i < 4; i++) {
  //   createBirdSprite(
  //     birdsBundle.robin,
  //     Math.floor(Math.random() * halfWidth()),
  //     Math.floor(Math.random() * app.screen.height),
  //   );
  //   createBirdSprite(
  //     birdsBundle.puffin,
  //     Math.floor(Math.random() * halfWidth()),
  //     Math.floor(Math.random() * app.screen.height),
  //   );
  // }

  // function createBirdSprite(bird, x, y) {
  //   const birdSprite = new Sprite(bird);
  //   birdSprite.eventMode = "static";
  //   birdSprite.cursor = "pointer";
  //   birdSprite.anchor.set(0.5);
  //   birdSprite.scale.set(0.1);
  //   birdSprite.on("pointerdown", onDragStart);
  //   birdSprite.x = x;
  //   birdSprite.y = y;
  //   if (bird === birdsBundle.robin) {
  //     treeContainer.addChild(birdSprite);
  //   } else {
  //     beachContainer.addChild(birdSprite);
  //   }
  // }

  // let dragTarget = null;

  // app.stage.eventMode = "static";
  // app.stage.hitArea = app.screen;
  // app.stage.on("pointerup", onDragEnd);
  // app.stage.on("pointerupoutside", onDragEnd);

  // function onDragMove(event) {
  //   if (dragTarget) {
  //     dragTarget.parent.toLocal(event.global, null, dragTarget.position);
  //   }
  // }

  // function onDragStart(event) {
  //   const target = event.currentTarget;
  //   if (!target) return;

  //   target.alpha = 0.5;
  //   dragTarget = target;
  //   app.stage.on("pointermove", onDragMove);
  // }

  // function onDragEnd() {
  //   if (dragTarget) {
  //     app.stage.off("pointermove", onDragMove);
  //     dragTarget.alpha = 1;
  //     dragTarget = null;
  //   }
  // }

  // const sceneBundle = await Assets.loadBundle("scene");

  // const treeSprite = new Sprite(sceneBundle.tree);
  // treeContainer.addChildAt(treeSprite, 0);

  // const beachSprite = new Sprite(sceneBundle.beach);
  // beachContainer.addChildAt(beachSprite, 0);

  // function fitAsBackground(sprite, width, height) {
  //   sprite.anchor.set(0.5);
  //   const baseWidth = sprite.texture.width || 1;
  //   const baseHeight = sprite.texture.height || 1;
  //   const coverScale = Math.max(width / baseWidth, height / baseHeight);
  //   sprite.scale.set(coverScale * 0.7);
  //   sprite.position.set(width / 2, height / 2);
  // }

  // function layoutScene() {
  //   const width = app.screen.width;
  //   const height = app.screen.height;
  //   const sideWidth = width / 2;

  //   beachContainer.position.set(sideWidth, 0);
  //   fitAsBackground(treeSprite, sideWidth, height);
  //   fitAsBackground(beachSprite, sideWidth, height);
  // }

  // layoutScene();
  // app.renderer.on("resize", layoutScene);
  // Create object to store sprite sheet data


  // Use Vite's base URL so asset paths still work if the app is hosted under a subpath.
  const baseUrl = import.meta.env.BASE_URL;

  async function createAnimatedSprite(
    birdName: AnimalEnum,
    position: Position,
  ): Promise<AnimatedSprite> {
    const framePaths: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      framePaths.push(`${baseUrl}animations/sprites/${birdName}/${birdName}_fly-${i}.png`);
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
    animatedSprite.position.set(position.x, position.y);
    animatedSprite.play();
    return animatedSprite;
  }


  const animatedRobin = await createAnimatedSprite("robin", {
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  });
  const animatedPuffin = await createAnimatedSprite("puffin", {
    x: app.screen.width / 4,
    y: app.screen.height / 2,
  });

  app.stage.addChild(animatedRobin);
  app.stage.addChild(animatedPuffin);



  initDevtools({ app });

  document.body.appendChild(app.canvas);
})();
