import { Person } from "../models/Person";
import { EventBus } from "../utils/EventBus";

export class ElevatorController {
  queues: Person[][] = [];
  capacity: number;
  elevatorLoadingTimeMs: number = 800;

  currentFloor: number = 0;

  state: "idle" | "moving" | "loading" = "idle";
  
  passengers: Person[] = [];
  
  private elevatorArrivedAt: number = performance.now();
  private direction: "up" | "down" = "up";

  constructor(
    floorsCount: number,
    elevatorCapacity: number,
    elevatorLoadingTimeMs: number
  ) {
    this.queues = Array.from({ length: floorsCount }, () => []);
    this.capacity = elevatorCapacity;
    this.elevatorLoadingTimeMs = elevatorLoadingTimeMs;

    EventBus.on("person_arrived_at_elevator", (payload) => {
      this.addToQueue(payload.person);
    });
    EventBus.on("elevator_arrived", (payload) => {
      this.onElevatorArrived(payload.floor);
    });
  }

  addToQueue(person: Person): void {
    this.queues[person.startFloor].push(person);
  }

  private onElevatorArrived = (floor: number): void => {
    this.elevatorArrivedAt = performance.now();
    this.currentFloor = floor;

    const leaving = this.passengers.filter((p) => p.targetFloor === floor);
    leaving.forEach((person) => {
      this.passengers = this.passengers.filter((p) => p !== person);
      EventBus.emit("person_arrived_at_destination", { person });
    });

    this.state = "loading";

    const availableSpots = this.capacity - this.passengers.length;

    for (let i = 0; i < availableSpots; i++) {
      if (this.queues[floor].length === 0) break;
      const person = this.queues[floor].shift();
      if (!person) break;
      this.passengers.push(person);
      EventBus.emit("person_move_to_elevator", { person });
    }
  };

  private travelToNearestQueue(): void {
    const floorsWithQueue = this.queues
      .map((queue, index) => ({ queue, index }))
      .filter(({ queue }) => queue.length > 0)
      .map(({ index }) => index);

    if (!floorsWithQueue.length) return;

    const nearestFloor = floorsWithQueue.reduce((prev, curr) => {
      return Math.abs(curr - this.currentFloor) <
        Math.abs(prev - this.currentFloor)
        ? curr
        : prev;
    });

    this.currentFloor = nearestFloor;

    EventBus.emit("move_elevator", { floor: nearestFloor });
    this.state = "moving";
  }

  private travelBasedOnPassengers(): void {
    const floor = this.currentFloor;
    const targetFloors = this.passengers.map((p) => p.targetFloor);

    if (targetFloors.length === 0) {
      this.state = "idle";
      return;
    }

    this.state = "moving";

    // Define where to go next
    // 2. Check where people go
    //  2.1 If all go up - go up
    //  2.2 If all go down - go down
    //  2.3 If mixed - continue in the same direction
    const allGoingUp = this.passengers.every((p) => p.targetFloor > floor);
    const allGoingDown = this.passengers.every((p) => p.targetFloor < floor);
    const someGoingUp = this.passengers.some((p) => p.targetFloor > floor);
    const someGoingDown = this.passengers.some((p) => p.targetFloor < floor);

    let nextDirection: "up" | "down" = "up";

    if (allGoingUp) {
      nextDirection = "up";
    } else if (allGoingDown) {
      nextDirection = "down";
    } else {
      const needsSameDirection =
        (this.direction === "up" && someGoingUp) ||
        (this.direction === "down" && someGoingDown);
      if (needsSameDirection) {
        nextDirection = this.direction;
      } else {
        nextDirection = this.direction === "up" ? "down" : "up";
      }
    }

    this.direction = nextDirection;

    let nextFloor: number | null = null;
    if (nextDirection === "up") {
      const floorsAbove = targetFloors.filter((f) => f > floor);
      if (floorsAbove.length > 0) {
        nextFloor = Math.min(...floorsAbove);
      }
    } else {
      const floorsBelow = targetFloors.filter((f) => f < floor);
      if (floorsBelow.length > 0) {
        nextFloor = Math.max(...floorsBelow);
      }
    }

    const isNotFull = this.passengers.length < this.capacity;
    if (isNotFull) {
      if (nextDirection === "up") {
        for (let f = floor + 1; f < this.queues.length; f++) {
          if (this.queues[f].length > 0) {
            if (nextFloor === null || f < nextFloor) {
              nextFloor = f;
            }
          }
        }
      } else {
        for (let f = floor - 1; f >= 0; f--) {
          if (this.queues[f].length > 0) {
            if (nextFloor === null || f > nextFloor) {
              nextFloor = f;
            }
          }
        }
      }
    }

    if (nextFloor !== null && nextFloor !== this.currentFloor) {
      EventBus.emit("move_elevator", { floor: nextFloor });
    }
  }

  update() {
    const now = performance.now();

    if (now - this.elevatorArrivedAt < this.elevatorLoadingTimeMs) {
      return;
    }

    const isElevatorEmpty = this.passengers.length === 0;

    if (isElevatorEmpty) {
      this.travelToNearestQueue();
    } else {
      this.travelBasedOnPassengers();
    }
  }
}
