import { Graphics, Container } from "pixi.js";
import { Tween } from "@tweenjs/tween.js";

import { PersonView } from "./PersonView";
import type { FloorView } from "./FloorView";

import type { Person } from "../models/Person";

import { ServiceLocator } from "../service-locator";

import { TweenManager } from "../utils/TweenManager";
import { EventBus } from "../utils/EventBus";

export class ElevatorView {
  public container: Container;
  public graphics: Graphics;
  public passengers: PersonView[] = [];

  public currentFloor: number = 0;
  public targetFloor: number | null = null;
  public capacity: number;
  public tweenContainer: Tween;

  private width: number;
  private height: number;
  private floorHeight: number;
  private totalFloors: number;

  public isMoving: boolean = false;

  constructor(
    width: number,
    height: number,
    floorHeight: number,
    capacity: number,
    totalFloors: number
  ) {
    this.width = width;
    this.height = height;
    this.floorHeight = floorHeight;
    this.capacity = capacity;
    this.totalFloors = totalFloors;

    this.container = new Container();
    this.tweenContainer = new Tween(this.container);
    this.graphics = new Graphics();

    TweenManager.add(this.tweenContainer);
    this.container.addChild(this.graphics);

    this.drawElevator();

    EventBus.on("move_elevator", this.onElevatorMove);
    EventBus.on("person_move_to_elevator", this.onPersonMoveToElevator);
    EventBus.on("person_arrived_at_destination", this.onPersonArrivedAtDestination);
  }

  private onElevatorMove = (payload: { floor: number }): void => {
    this.moveToFloor(payload.floor);
  }
  private onPersonMoveToElevator = (payload: { person: Person }): void => {
    const { person } = payload;
    const floor = ServiceLocator.get<FloorView>(`floor_${person.startFloor}`);
    const personView = floor.waitingPersonsViews.find((p) => p.model === person);
    if (!personView) return;

    floor.removePerson(person);
    this.addPassenger(personView);
  };
  private onPersonArrivedAtDestination = (payload: { person: Person }): void => {
    const { person } = payload;
    const personView = this.passengers.find((p) => p.model === person);
    const floorView = ServiceLocator.get<FloorView>(`floor_${person.targetFloor}`);
    if (!personView || !floorView) return;

    this.removePassenger(personView);
    floorView.addPersonFromElevator(personView);
  };

  private drawElevator(): void {
    this.graphics.clear();

    this.graphics.rect(0, 0, this.width, this.height);
    this.graphics.fill(0x333333);
  }

  public moveToFloor(floorNumber: number) {
    if (this.isMoving) return;
    this.isMoving = true;

    const targetY = (this.totalFloors - floorNumber - 1) * this.floorHeight;

    const floorsDelta = Math.abs(floorNumber - this.currentFloor);

    this.tweenContainer.stop();
    this.tweenContainer
      .to({ y: targetY }, floorsDelta * 1000)
      .onComplete(() => {
        this.currentFloor = floorNumber;
        this.isMoving = false;
        EventBus.emit("elevator_arrived", { floor: this.currentFloor });
      })
      .startFromCurrentValues();
  }

  public addPassenger(person: PersonView) {
    this.passengers.push(person);
    this.container.addChild(person.container);

    this.repositionPassengers();
  }

  private removePassenger(person: PersonView): void {
    this.passengers = this.passengers.filter((p) => p !== person);
    this.container.removeChild(person.container);
  }

  private repositionPassengers(): void {
    this.passengers.forEach((person, index) => {
      const targetX = index * (this.width / this.capacity);
      const targetY = this.height - person.container.height;

      person.moveTo(targetX, targetY);
    });
  }

  public destroy(): void {
    EventBus.off("move_elevator", this.onElevatorMove);
    EventBus.off("person_move_to_elevator", this.onPersonMoveToElevator);
    EventBus.off("person_arrived_at_destination", this.onPersonArrivedAtDestination);
    this.container.removeChildren();
    this.container.destroy({ children: true, texture: true });
  }
}