import { Container, Sprite, Assets } from "pixi.js";

export interface Habitats {
  treeContainer: Container;
  beachContainer: Container;
  arcticContainer: Container;
  treeSprite: Sprite;
  beachSprite: Sprite;
  arcticSprite: Sprite;
}

export async function setupHabitats(): Promise<Habitats> {
  const treeContainer = new Container();
  const beachContainer = new Container();
  const arcticContainer = new Container();

  const sceneBundle = await Assets.loadBundle("scene");

  const treeSprite = new Sprite(sceneBundle.tree);
  treeContainer.addChildAt(treeSprite, 0);

  const beachSprite = new Sprite(sceneBundle.beach);
  beachContainer.addChildAt(beachSprite, 0);

  const arcticSprite = new Sprite(sceneBundle.arctic);
  arcticContainer.addChildAt(arcticSprite, 0);

  return {
    treeContainer,
    beachContainer,
    arcticContainer,
    treeSprite,
    beachSprite,
    arcticSprite,
  };
}

