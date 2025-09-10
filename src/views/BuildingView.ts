import { Graphics, Container } from "pixi.js";
import { Tween } from "@tweenjs/tween.js";

import { ElevatorView } from "./ElevatorView";
import { FloorView } from "./FloorView";

import { ServiceLocator } from "../service-locator";

export class BuildingView {
  public container: Container;
  public graphics: Graphics;
  public floors: FloorView[];
  public elevator: ElevatorView;
  public width: number;
  public height: number;
  public floorHeight: number;
  public numFloors: number;
  public tweenContainer: Tween;

  constructor(
    numFloors: number,
    floorHeight: number,
    buildingWidth: number,
    elevatorWidth: number,
    elevatorHeight: number,
    elevatorCapacity: number
  ) {
    this.numFloors = numFloors;
    this.width = buildingWidth;
    this.floorHeight = floorHeight;
    this.height = numFloors * floorHeight;

    this.container = new Container();
    this.tweenContainer = new Tween(this.container);

    this.graphics = new Graphics();
    this.graphics.rect(0, 0, this.width, this.height);
    this.graphics.fill(0xcccccc);
    this.container.addChild(this.graphics);
    
    this.elevator = new ElevatorView(
      elevatorWidth,
      elevatorHeight,
      this.floorHeight,
      elevatorCapacity,
      numFloors
    );
    ServiceLocator.register('elevator', this.elevator);

    this.floors = [];
    for (let i = 0; i < numFloors; i++) {
      const floor = new FloorView(i, this.width, floorHeight, this.elevator);
      ServiceLocator.register(`floor_${i}`, floor);
      floor.container.y = this.height - (i + 1) * floorHeight;
      this.container.addChild(floor.container);
      this.floors.push(floor);
    }

    this.elevator.container.x = 0;
    this.elevator.container.y = this.height - this.floorHeight;
    this.container.addChild(this.elevator.container);
  }

  public destroy() {
    this.tweenContainer.stop();
    this.tweenContainer = null as any;

    for (let i = 0; i < this.floors.length; i++) {
      this.floors[i].destroy();

      ServiceLocator.unregister(`floor_${i}`);
    }
    this.floors = [];

    this.elevator.destroy();
    ServiceLocator.unregister("elevator");

    this.graphics.destroy({ children: true, texture: true });
    this.container.removeChildren();
    this.container.destroy({ children: true, texture: true });
  }
}