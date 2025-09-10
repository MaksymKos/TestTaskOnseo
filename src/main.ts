import { Application } from "pixi.js";

import { BuildingView } from "./views/BuildingView";
import { TweenManager } from "./utils/TweenManager";

import { ConfigController } from "./controllers/ControlPanel";
import { PersonSpawnController } from "./controllers/PersonSpawnController";
import { ElevatorController } from "./controllers/ElevatorController";

import "./style.css";

const config = {
  floors: 7,
  elevatorCapacity: 3,
  floorHeight: 100,
  buildingWidth: 600,
  elevatorWidth: 80,
  elevatorHeight: 100,
  elevatorStopTime: 800,
};

class ElevatorSimulationApp {
  private app: Application;
  private building: BuildingView;
  private personSpawnController: PersonSpawnController;
  private elevatorController: ElevatorController;
  configController: ConfigController;

  lastUpdateTime: number = performance.now();

  constructor() {
    this.app = new Application();
    this.building = new BuildingView(
      config.floors,
      config.floorHeight,
      config.buildingWidth,
      config.elevatorWidth,
      config.elevatorHeight,
      config.elevatorCapacity
    );

    this.personSpawnController = new PersonSpawnController(config.floors);

    this.elevatorController = new ElevatorController(
      config.floors,
      config.elevatorCapacity,
      config.elevatorStopTime
    );

    this.configController = new ConfigController(
      config.floors,
      config.elevatorCapacity,
      this.handleConfigChange.bind(this)
    );
  }

  async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      backgroundColor: 0xeeeeee,
      resizeTo: window,
    });

    document.body.appendChild(this.app.canvas);

    this.building.container.x = (window.innerWidth - config.buildingWidth) / 2;
    this.building.container.y = (window.innerHeight - this.building.height) / 2;

    this.app.stage.addChild(this.building.container);

    this.building.elevator.capacity = config.elevatorCapacity;

    const animate = () => {
      requestAnimationFrame(animate);
      this.update();
    };

    animate();
  }

  private async handleConfigChange(floors: number, capacity: number) {
    config.floors = floors;
    config.elevatorCapacity = capacity;

    this.app.stage.removeChild(this.building.container);
    this.building.destroy();
    this.elevatorController.destroy();
    this.personSpawnController.destroy();
    TweenManager.removeAll();

    this.building = new BuildingView(
      config.floors,
      config.floorHeight,
      config.buildingWidth,
      config.elevatorWidth,
      config.elevatorHeight,
      config.elevatorCapacity
    );

    this.building.container.x = (window.innerWidth - config.buildingWidth) / 2;
    this.building.container.y = (window.innerHeight - this.building.height) / 2;
    this.app.stage.addChild(this.building.container);

    this.personSpawnController = new PersonSpawnController(config.floors);
    
    this.elevatorController = new ElevatorController(
      config.floors,
      config.elevatorCapacity,
      config.elevatorStopTime
    );
    this.update();
  }

  private update(): void {
    const delta = (performance.now() - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = performance.now();
    TweenManager.update(this.lastUpdateTime);

    this.personSpawnController.update(delta);
    this.elevatorController.update();
  }
}

const app = new ElevatorSimulationApp();
app.init().catch(console.error);