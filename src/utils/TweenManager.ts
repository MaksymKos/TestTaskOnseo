import { Group, Tween } from "@tweenjs/tween.js";

export class TweenManager {
  private static group = new Group();

  static add(tween: Tween<any>) {
    TweenManager.group.add(tween);
  }

  static update(time: number) {
    TweenManager.group.update(time);
  }

  static getAll() {
    return TweenManager.group.getAll();
  }

  static remove(tween: Tween<any>) {
    return TweenManager.group.remove(tween);
  }
}