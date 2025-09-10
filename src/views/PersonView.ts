import { Graphics, Container, Text } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { TweenManager } from "../utils/TweenManager";
import type { Person } from "../models/Person";

const PERSON_MOVEMENT_SPEED = 0.3; // pixels per millisecond

export class PersonView {
  public container: Container;
  public graphics: Graphics;
  private width: number = 30;
  private height: number = 50;
  private color: number;
  public model: Person;

  public tweenContainer: Tween;

  public isMoving: boolean = false;

  constructor(model: Person) {
    this.model = model;

    this.color = this.model.targetFloor > this.model.startFloor ? 0x3498db : 0x2ecc71;

    this.container = new Container();
    this.tweenContainer = new Tween(this.container);
    this.tweenContainer.dynamic(true);
    TweenManager.add(this.tweenContainer);

    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.drawPerson();

    this.container.x = 550 - this.width - 20;
    this.container.y = 0;
  }

  private drawPerson(): void {
    this.graphics.clear();

    this.graphics.rect(0, 0, this.width, this.height);
    this.graphics.fill(this.color);

    const floorLabel = new Text({
      text: `${this.model.targetFloor}`,
      style: {
        fill: 0xffffff,
        fontSize: 14,
        fontWeight: "bold",
        align: "center",
      },
    });

    floorLabel.x = (this.width - floorLabel.width) / 2;
    floorLabel.y = (this.height - floorLabel.height) / 2;

    this.container.addChild(floorLabel);
  }

  private _unresolvedCallbacks = new Set<() => void>();

  public moveTo(x: number, y: number, onAnimationEnd?: () => void) {
    if (this.isMoving) this.tweenContainer.stop();

    this.isMoving = true;
    const distance = Math.hypot(x - this.container.x, y - this.container.y);

    if (onAnimationEnd) this._unresolvedCallbacks.add(onAnimationEnd);

    this.tweenContainer
      .to({ x, y }, distance / PERSON_MOVEMENT_SPEED)
      .easing(Easing.Quadratic.In)
      .onComplete(() => {
        this._unresolvedCallbacks.forEach((cb) => cb());
        this._unresolvedCallbacks.clear();
        this.isMoving = false;
      })
      .startFromCurrentValues(performance.now());
  }
}