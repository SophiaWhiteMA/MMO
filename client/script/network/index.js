import map from "./inbound/map.js";
import entity from "./inbound/entity.js";

const queuedCommands = [];

/**
 * @type {WebSocket}
 */
let socket;

/**
 * Maps command labels to functions. All functions take a string array is input.
 * @type {Map<String, Function>}
 */
const commandMap = {
    'map': map,
    'entity': entity
}


/**
 * 
 * @param {MessageEvent} evt 
 */
const onOpen = (evt) => {
    socket.send(`login User<${crypto.randomUUID()}> password`);
}

/**
 * Connects the client to the server and registers websocket handlers. 
 * 
 */
export const init = () => {
    socket = socket = new WebSocket("ws://127.0.0.1:8080/ws/listener");
    socket.onopen = onOpen;
    socket.onmessage = (evt) => queuedCommands.push(evt.data);
    socket.onerror = err => console.log(err);
    socket.onclose = (evt) => console.log("Closed connection.");
}


/**
 * 
 * @param {String} command 
 */
const processInboundCommand = (command, timeMs) => {
    const splits = command.split(' ');
    //console.log(command);
    const label = splits.shift();
    const _function = commandMap[label];
    _function(splits, timeMs);
}


export const processQueuedInboundNetworkCommands = (timeMs) => {
    while(queuedCommands.length > 0) {
        const command = queuedCommands.shift();
        processInboundCommand(command, timeMs);
    }
}

export const sendCommand = (command) => {
    socket.send(command);
}
