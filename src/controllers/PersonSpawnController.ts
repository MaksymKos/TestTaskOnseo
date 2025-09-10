import { Person } from "../models/Person";
import { EventBus } from "../utils/EventBus";

const MIN_SPAWN_TIME = 4;
const MAX_SPAWN_TIME = 10;

const MAX_PERSONS_PER_FLOOR = 10;

export class PersonSpawnController {
  floors: Person[][];
  timers: number[]; // time until next spawn for each floor
  floorCount: number;

  constructor(floorCount: number) {
    this.floorCount = floorCount;
    this.floors = Array.from({ length: floorCount + 1 }, () => []);
    this.timers = Array.from({ length: floorCount + 1 }, () =>
      this.getRandomSpawnTime()
    );

    EventBus.on("person_move_to_elevator", this.onPersonMoveToElevator);
  }

  private onPersonMoveToElevator = (payload: { person: Person }): void => {
    const floor = payload.person.startFloor;
    this.floors[floor] = this.floors[floor].filter((p) => p !== payload.person);
  }

  private getRandomSpawnTime(): number {
    return MIN_SPAWN_TIME + Math.random() * (MAX_SPAWN_TIME - MIN_SPAWN_TIME);
  }

  private spawnerTick(delta: number) {
    for (let i = 0; i < this.floors.length; i++) {
      this.timers[i] -= delta;

      if (this.timers[i] <= 0) {
        if (this.floors[i].length >= MAX_PERSONS_PER_FLOOR) {
          this.timers[i] = this.getRandomSpawnTime();
          continue;
        }

        const person: Person = new Person(i, this.floorCount - 1);
        EventBus.emit("person_spawned", { person });

        this.floors[i].push(person);

        this.timers[i] = this.getRandomSpawnTime();
      }
    }
  }

  update(delta: number) {
    this.spawnerTick(delta);
  }

  destroy(): void {
    EventBus.off("person_move_to_elevator", this.onPersonMoveToElevator);
  }
}