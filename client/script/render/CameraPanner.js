import MapRenderer from "./MapRenderer.js";

/**
 * Child class of the MapRenderer. 
 */
class CameraPanner {

    mapRenderer;

    panTimeStart;
    panDuration = 0;
    isPanning = false;
    panDeltas = { x: 0, y: 0 };
    panOrigin = { x: 0, y: 0 };

    /**
     * 
     * @param {MapRenderer} mapRenderer 
     */
    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
    }

    /**
     * Pans the camera to the specified position such that the panning will take 'duration' ms from start to finish.
     * 
     * If this method is called while the camera is already being panned, then the old panning sequence will be aborted
     * and replaced with the values provided by the new parameters. 
     * @param {*} x 
     * @param {*} y 
     * @param {*} duration 
     */
    panCamera = (x, y, duration) => {
        this.panDuration = duration;
        this.isPanning = true;
        this.panDeltas.x = x - this.mapRenderer.cameraX;
        this.panDeltas.y = y - this.mapRenderer.cameraY;
        this.panOrigin = { x: this.mapRenderer.cameraX, y: this.mapRenderer.cameraY };
        this.panTimeStart = this.mapRenderer.currentFrameTimeMs;
    }

        onFrame = () => {

            if (!this.isPanning)
                return;

            if (this.panTimeStart === undefined)
                this.panTimeStart = this.mapRenderer.currentFrameTimeMs;

            let fraction = (this.mapRenderer.currentFrameTimeMs - this.panTimeStart) / this.panDuration;

            if (fraction > 1) {
                fraction = 1
            }

            const finalPanFrame = fraction === 1;

            const newCameraX = this.panOrigin.x + fraction * this.panDeltas.x;
            const newCameraY = this.panOrigin.y + fraction * this.panDeltas.y;    

            this.mapRenderer.cameraX = newCameraX;
            this.mapRenderer.cameraY = newCameraY;

            if (finalPanFrame) {
                this.isPanning = false;
            }


        }

}

export default CameraPanner;