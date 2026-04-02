import { sendCommand } from "../index.js";

export const move = (x, y) => sendCommand(`move ${x} ${y}`);