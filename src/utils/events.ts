import type { Person } from "../models/Person";

export interface Events {
  person_spawned: { person: Person; };
  person_arrived_at_elevator: { person: Person };
  person_arrived_at_destination: { person: Person };
  person_move_to_elevator: { person: Person };
  move_elevator: { floor: number };
  elevator_arrived: { floor: number };
}