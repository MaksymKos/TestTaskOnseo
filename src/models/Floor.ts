import type { Person } from "./Person";

export class Floor { 
  public floorNumber: number;
  public waitingPersons: Person[] = [];

  constructor(floorNumber: number) { 
    this.floorNumber = floorNumber;
  }
}