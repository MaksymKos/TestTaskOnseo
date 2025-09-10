import { Graphics, Text, Container } from "pixi.js";

import { PersonView } from "./PersonView";
import type { ElevatorView } from "./ElevatorView";

import { Floor } from "../models/Floor";
import { Person } from "../models/Person";
import { EventBus } from "../utils/EventBus";

export class FloorView {
  public container: Container;
  public graphics: Graphics;
  private floorWidth: number;
  private floorHeight: number;
  public elevator: ElevatorView;
  public waitingPersonsViews: PersonView[] = [];

  public model: Floor;
  public startTime = 0;
  readonly personSpacing = 100;

  constructor(
    floorNumber: number,
    width: number,
    height: number,
    elevator: ElevatorView
  ) {
    this.model = new Floor(floorNumber);
    this.floorWidth = width;
    this.floorHeight = height;
    this.elevator = elevator;

    this.container = new Container();

    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.drawFloor();

    const floorLabel = new Text({
      text: `Floor ${floorNumber}`,
      style: {
        fill: 0x000000,
        fontSize: 16,
      },
    });
    floorLabel.x = width - floorLabel.width;
    floorLabel.y = 0;
    this.container.addChild(floorLabel);

    EventBus.on("person_spawned", this.onPersonSpawned);
    EventBus.on("person_move_to_elevator", this.onMoveToElevator);
  }

  private onMoveToElevator = (payload: { person: Person }): void => {
      const floor = payload.person.startFloor;
      if (floor !== this.model.floorNumber) return;
      this.removePerson(payload.person);
  }
  private onPersonSpawned = (payload: { person: Person }): void => {
    const { person } = payload;
    if (person.startFloor !== this.model.floorNumber) return;
    this.spawnNewPerson(person);
  };

  private drawFloor(): void {
    this.graphics.clear();

    this.graphics.rect(0, 0, this.floorWidth, this.floorHeight);
    this.graphics.fill(0xeeeeee);
    this.graphics.stroke();
  }

  private animatePersonComingToElevator(person: PersonView): void {
    const index = this.waitingPersonsViews.indexOf(person);
    if (index === -1) return;
    const expectedX = this.personSpacing + index * 40;
    person.moveTo(expectedX, person.container.y, () => {
      EventBus.emit("person_arrived_at_elevator", { person: person.model });
    });
  }

  private animatePersonLeavingFloor(person: PersonView): void {
    person.moveTo(600, person.container.y, () => {
      this.container.removeChild(person.container);
    });
  }

  public spawnNewPerson(personModel: Person): void {
    const person = new PersonView(personModel);
    this.container.addChild(person.container);
    this.waitingPersonsViews.push(person);
    this.animatePersonComingToElevator(person);
  }

  public addPersonFromElevator(person: PersonView): void {
    this.container.addChild(person.container);
    this.animatePersonLeavingFloor(person);
  }

  public removePerson(person: Person): void {
    this.waitingPersonsViews = this.waitingPersonsViews.filter(
      (p) => p.model !== person
    );

    this.waitingPersonsViews.forEach((p, i) => {
      const expectedX = this.personSpacing + i * 40;
      p.moveTo(expectedX, p.container.y);
    });
  }

  public destroy(): void {
    EventBus.off("person_spawned", this.onPersonSpawned);
    EventBus.off("person_move_to_elevator", this.onMoveToElevator);
    this.container.removeChildren();
    this.container.destroy({ children: true, texture: true });
  }
}