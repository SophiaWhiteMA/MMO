import ChatInterface from "./ChatInterface.js";
import GameInterface from "./GameInterface.js";
import MapRenderer from "./map/MapRenderer.js";
import RightClickMenu from './RightClickMenu.js';

const rootInterface = new GameInterface();
rootInterface.setSize(1, 1);

const mapRenderer = new MapRenderer(rootInterface, 0, 0);
mapRenderer.setSize(1, 1)

const chatInterface = new ChatInterface(rootInterface);
chatInterface.setSize(0.3, 0.25)
chatInterface.setPositionRelativeToParent(0, 0.75);

const rightClickMenu = new RightClickMenu(rootInterface);
rightClickMenu.setSize(0.05, 0.2);
rightClickMenu.setPositionRelativeToParent(0, 0);


document.getElementById('root').addEventListener('mouseleave', (evt) => {
    rootInterface._mouseDown = false;
    rootInterface.getAllChildren().forEach(child => child._mouseDown = false);
});

document.getElementById('root').addEventListener('mouseup', evt => {
        rootInterface._mouseDown = false;
    rootInterface.getAllChildren().forEach(child => child.onMouseUp(evt));
})

window.addEventListener('keyup', (e) => rootInterface.onKeyUp(e));
window.addEventListener('keydown', (e) => rootInterface.onKeyDown(e));

window.addEventListener('resize', (evt) => rootInterface.onWindowResize(evt));



export {
    rootInterface,
    mapRenderer,
    chatInterface,
    rightClickMenu
}