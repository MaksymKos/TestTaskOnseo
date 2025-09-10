function getRandomInRangeButNot(min: number, max: number, exclude: number) {
  let randomNumber;

  do {
    randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (randomNumber === exclude);

  return randomNumber;
}

type PersonStatus = 'moveToElevator' | 'arrivedAtQueue' | 'moveOutOfBuilding' | 'inElevator';

export class Person {
  readonly startFloor: number;
  readonly targetFloor: number;

  public isInElevator: boolean = false;
  public isWaitingForElevator: boolean = true;
  public status: PersonStatus = "moveToElevator"

  constructor(
    startFloor: number,
    maxFloor: number
  ) {
    this.startFloor = startFloor;
    this.targetFloor = getRandomInRangeButNot(0, maxFloor, startFloor);
  }
}