import {
  Application,
  Graphics,
  Text,
  TextStyle,
  Sprite,
  Assets,
  Container,
} from "pixi.js";
import { initDevtools } from "@pixi/devtools";

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

  const birdsBundle = await Assets.loadBundle("birds");

  const halfWidth = () => app.screen.width / 2;

  for (let i = 0; i < 4; i++) {
    createBirdSprite(
      birdsBundle.robin,
      Math.floor(Math.random() * halfWidth()),
      Math.floor(Math.random() * app.screen.height),
    );
    createBirdSprite(
      birdsBundle.puffin,
      Math.floor(Math.random() * halfWidth()),
      Math.floor(Math.random() * app.screen.height),
    );
  }

  function createBirdSprite(bird, x, y) {
    const birdSprite = new Sprite(bird);
    birdSprite.eventMode = "static";
    birdSprite.cursor = "pointer";
    birdSprite.anchor.set(0.5);
    birdSprite.scale.set(0.1);
    birdSprite.on("pointerdown", onDragStart);
    birdSprite.x = x;
    birdSprite.y = y;
    if (bird === birdsBundle.robin) {
      treeContainer.addChild(birdSprite);
    } else {
      beachContainer.addChild(birdSprite);
    }
  }

  let dragTarget = null;

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  function onDragMove(event) {
    if (dragTarget) {
      dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
  }

  function onDragStart(event) {
    const target = event.currentTarget;
    if (!target) return;

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

  const sceneBundle = await Assets.loadBundle("scene");

  const treeSprite = new Sprite(sceneBundle.tree);
  treeContainer.addChildAt(treeSprite, 0);

  const beachSprite = new Sprite(sceneBundle.beach);
  beachContainer.addChildAt(beachSprite, 0);

  function fitAsBackground(sprite, width, height) {
    sprite.anchor.set(0.5);
    const baseWidth = sprite.texture.width || 1;
    const baseHeight = sprite.texture.height || 1;
    const coverScale = Math.max(width / baseWidth, height / baseHeight);
    sprite.scale.set(coverScale * 0.7);
    sprite.position.set(width / 2, height / 2);
  }

  function layoutScene() {
    const width = app.screen.width;
    const height = app.screen.height;
    const sideWidth = width / 2;

    beachContainer.position.set(sideWidth, 0);
    fitAsBackground(treeSprite, sideWidth, height);
    fitAsBackground(beachSprite, sideWidth, height);
  }

  layoutScene();
  app.renderer.on("resize", layoutScene);
  initDevtools({ app });

  document.body.appendChild(app.canvas);
})();
