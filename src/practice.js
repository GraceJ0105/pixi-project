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
    // width: window.innerWidth,
    // height: window.innerHeight,
    resizeTo: window,
    // transparent: false,
    // antialias: true,
    backgroundAlpha: 1,
    backgroundColor: 0x050a1a,
  });

  app.canvas.style.position = "absolute";

  const rectangle = new Graphics()
    .rect(200, 200, 100, 150)
    .fill({ color: 0xffea00, alpha: 0.9 })
    .stroke({ color: 0x00ff00, width: 8 });

  app.stage.addChild(rectangle);

  const star = new Graphics()
    .star(1000, 250, 12, 80, 20)
    .fill({ color: 0xffffff, alpha: 0.9 });

  app.stage.addChild(star);

  const font = await Assets.load("/fonts/Roboto/static/Roboto-Regular.ttf");

  const textStyle = new TextStyle({
    fill: "#1fb7ad",
    fontFamily: font.family,
    fontSize: 35,
    fontVariant: "small-caps",
    fontWeight: "lighter",
  });

  const text = new Text({
    text: "Hello World",
    style: textStyle,
  });
  // const texture = await Assets.load('/images/bird.png');

  // const sprite = new Sprite(texture)
  // sprite.scale.set(0.5);
  // // sprite.x = 100;
  // // sprite.y = 100;
  // sprite.position.set(500, 500);

  // sprite.anchor.set(0.5);
  // sprite.rotation = Math.PI / 4;
  // app.ticker.add((ticker) => {
  //     sprite.rotation += 0.01 * ticker.deltaTime;
  // });

  //app.stage.addChild(sprite);

  app.stage.addChild(text);

  rectangle.eventMode = "static";

  rectangle.cursor = "pointer";
  rectangle.on("mousedown", moveRect);

  function moveRect(event) {
    rectangle.x -= 5;
    rectangle.y += 5;
  }

  const twinkleStars = [];
  const starCount = 80;
  for (let i = 0; i < starCount; i += 1) {
    const twinkleStar = new Graphics()
      .circle(0, 0, Math.random() * 2 + 1)
      .fill({ color: 0xffffff, alpha: 1 });

    twinkleStar.position.set(
      Math.random() * app.screen.width,
      Math.random() * app.screen.height,
    );
    twinkleStar.alpha = Math.random();
    app.stage.addChild(twinkleStar);

    twinkleStars.push({
      graphic: twinkleStar,
      speed: Math.random() * 0.08 + 0.02,
      phase: Math.random() * Math.PI * 2,
    });
  }

  app.ticker.add((ticker) => {
    twinkleStars.forEach((twinkleStar) => {
      twinkleStar.phase += twinkleStar.speed * ticker.deltaTime;
      // Alpha oscillation creates random on/off star twinkle.
      twinkleStar.graphic.alpha =
        0.15 + ((Math.sin(twinkleStar.phase) + 1) / 2) * 0.85;
    });
  });

  const treeContainer = new Container();
  treeContainer.position.set(0, 0);

  const beachContainer = new Container();
  beachContainer.position.set(app.screen.width / 2, 0);

  app.stage.addChild(treeContainer);
  app.stage.addChild(beachContainer);
  
  app.renderer.on("resize", () => {
    beachContainer.position.set(app.screen.width / 2, 0);
  });

  const pidgeotTexture = await Assets.load("/images/pidgeot.png");

  const pidgeot = new Sprite(pidgeotTexture);
  pidgeot.scale.set(0.3);
  pidgeot.position.set(100, 100);
  pidgeot.x = 100;
  pidgeot.y = 50;
  beachContainer.addChild(pidgeot);

  const zapdosTexture = await Assets.load("/images/zapdos.png");
  const zapdos = new Sprite(zapdosTexture);
  zapdos.scale.set(0.3);
  zapdos.position.set(260, 140);
  beachContainer.addChild(zapdos);

  const birdsBundle = await Assets.loadBundle("birds");
  const plantsBundle = await Assets.loadBundle("plants");

  const puffinSprite = new Sprite(birdsBundle.puffin);
  puffinSprite.scale.set(0.3);
  puffinSprite.position.set(100, 100);
  beachContainer.addChild(puffinSprite);

  const halfWidth = () => app.screen.width / 2;

  for (let i = 0; i < 7; i++) {
    createRobinSprite(
      Math.floor(Math.random() * halfWidth()),
      Math.floor(Math.random() * app.screen.height),
    );
  }

  function createRobinSprite(x, y) {
    const robinSprite = new Sprite(birdsBundle.robin);

    robinSprite.eventMode = "static";
    robinSprite.cursor = "pointer";
    robinSprite.anchor.set(0.5);
    robinSprite.scale.set(0.2);

    robinSprite.on("pointerdown", onDragStart);

    robinSprite.x = x;
    robinSprite.y = y;

    treeContainer.addChild(robinSprite);
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

  const plantSprite = new Sprite(plantsBundle.plant);
  plantSprite.scale.set(0.3);
  plantSprite.position.set(300, 250);
  beachContainer.addChild(plantSprite);

  initDevtools({ app });

  document.body.appendChild(app.canvas);
})();
