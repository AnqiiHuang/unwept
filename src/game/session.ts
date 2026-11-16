import {
  commitSave,
  loadSettings,
  newGame,
  saveSettings,
  type GameState,
  type Settings,
} from '../core/state';

let state: GameState = newGame();
let settings: Settings = loadSettings();

export function getState() {
  return state;
}

export function setState(next: GameState) {
  state = next;
}

export function getSettings() {
  return settings;
}

export function setSettings(next: Settings) {
  settings = next;
  saveSettings(next);
}

export function commit(next?: GameState) {
  if (next) state = next;
  commitSave(state);
}

export function resetGame() {
  state = newGame();
  commit(state);
}
