import GameInterface from "./GameInterface.js";
import MapRenderer from "./map/MapRenderer.js";
import WindowInterface from "./WindowInterface.js";

const rootInterface = new GameInterface();

const mapRenderer = new MapRenderer(rootInterface, 0, 0);


const childOne = new WindowInterface(rootInterface);
childOne._parent = rootInterface;
childOne.setSize(1500, 500);
childOne.title = 'Child 1'

const child2 = new WindowInterface(childOne);
child2.title = 'Child 2';
child2.setSize(250, 250);
child2.setPositionRelativeToParent(100, 100);

const child3 = new WindowInterface(childOne);
child3.title = 'Child 3';
child3.setSize(400, 200);
child3.setPositionRelativeToParent(375, 100);


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
    mapRenderer
}