export class ConfigController {
  private panel!: HTMLElement;
  private floorInput!: HTMLInputElement;
  private capacityInput!: HTMLInputElement;
  private applyButton!: HTMLButtonElement;

  private config: {
    floors: number;
    elevatorCapacity: number;
  };

  private onConfigChange: (floors: number, capacity: number) => void;

  constructor(
    initialFloors: number,
    initialCapacity: number,
    onConfigChange: (floors: number, capacity: number) => void
  ) {
    this.config = {
      floors: initialFloors,
      elevatorCapacity: initialCapacity,
    };
    this.onConfigChange = onConfigChange;
    this.createControlPanel();
  }

  private createControlPanel() {
    this.panel = document.createElement("div");
    this.panel.className = "elevator-controller";

    const title = document.createElement("h3");
    title.textContent = "Налаштування симуляції";
    this.panel.appendChild(title);

    const floorGroup = document.createElement("div");
    floorGroup.className = "control-group";

    const floorLabel = document.createElement("label");
    floorLabel.textContent = "Поверхи (4-10):";

    this.floorInput = document.createElement("input");
    this.floorInput.type = "number";
    this.floorInput.min = "4";
    this.floorInput.max = "10";
    this.floorInput.value = this.config.floors.toString();

    floorGroup.appendChild(floorLabel);
    floorGroup.appendChild(this.floorInput);
    this.panel.appendChild(floorGroup);

    const capacityGroup = document.createElement("div");
    capacityGroup.className = "control-group";

    const capacityLabel = document.createElement("label");
    capacityLabel.textContent = "Місткість ліфта (2-4):";

    this.capacityInput = document.createElement("input");
    this.capacityInput.type = "number";
    this.capacityInput.min = "2";
    this.capacityInput.max = "4";
    this.capacityInput.value = this.config.elevatorCapacity.toString();

    capacityGroup.appendChild(capacityLabel);
    capacityGroup.appendChild(this.capacityInput);
    this.panel.appendChild(capacityGroup);

    this.applyButton = document.createElement("button");
    this.applyButton.textContent = "Перезапустити";
    this.applyButton.onclick = this.handleApply.bind(this);

    this.panel.appendChild(this.applyButton);

    document.body.appendChild(this.panel);
  }

  private handleApply() {
    const floors = Math.min(
      10,
      Math.max(4, parseInt(this.floorInput.value) || 4)
    );
    const capacity = Math.min(
      4,
      Math.max(2, parseInt(this.capacityInput.value) || 2)
    );

    this.floorInput.value = floors.toString();
    this.capacityInput.value = capacity.toString();

    this.config = {
      floors,
      elevatorCapacity: capacity,
    };

    this.onConfigChange(floors, capacity);
  }
}