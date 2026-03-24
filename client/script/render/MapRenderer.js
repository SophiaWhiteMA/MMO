import Map from "../level/Map.js";
import CameraPanner from "./CameraPanner.js";


export class MapRenderer {

    /** @type {Map} */
    map;
    cameraX;
    cameraY;

    viewportCanvas;
    viewportCanvasContext;

    bufferCanvas;
    bufferCanvasContext;

    backgroundTileBufferCanvas;
    backgroundTileBufferCanvasContext;

    resizeObserver;

    lastBufferMinTileX = undefined;
    lastBufferMinTileY = undefined;


    scaleFactor = 1;

    /** @type {boolean} Internal variable used to track whether or not a complete re-render is required. */
    forceCompleteRerender = true;

    /** @type {number} The timestamp when the current frame began rendering */
    currentFrameTimeMs = 0;

    /** @type {number} The time between when this frame started rendering and when the last frame started rendering */
    frameTimeDelta = 0;

    cameraPanner;


    setMap(map) {
        this.map = map;
        this.#resizeCanvases();
        this.forceCompleteRerender = true;
    }

    getMap() {
        return this.map;
    }

    /**
     * 
     * @param {Map} map 
     * @param {number} cameraX 
     * @param {number} cameraY 
     */
    constructor(cameraX, cameraY) {
        this.cameraX = cameraX;
        this.cameraY = cameraY;

        // Primary canvas that is actually visible and shown on screen.
        this.viewportCanvas = document.getElementById('viewport-canvas');
        this.viewportCanvasContext = this.viewportCanvas.getContext('2d');
        this.viewportCanvas.width = 0; //We make this 0 here to guarantee that the resizeCanvases method will run correctly. 
        this.viewportCanvas.height = 0;

        // Canvas we write everything to before displaying it to the real canvas. Slightly bigger than viewport canvas. 
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvasContext = this.bufferCanvas.getContext('2d');

        // Canvas we write background tiles to before we copy them to the buffer canvas
        this.backgroundTileBufferCanvas = document.createElement('canvas');
        this.backgroundTileBufferCanvasContext = this.backgroundTileBufferCanvas.getContext('2d');


        this.resizeObserver = new ResizeObserver(this.#resizeObserverMethod);
        this.resizeObserver.observe(this.viewportCanvas);
        this.cameraPanner = new CameraPanner(this)
    }

    #resizeObserverMethod = (entries) => {
        for (const entry of entries) {
            if (entry.target === this.viewportCanvas) {
                if (this.#resizeCanvases()) {
                    this.forceCompleteRerender = true;
                }
            }
        }
    }


    /**
     * 
     * @returns Whether or not the canvases actually changed size. 
     */
    #resizeCanvases = () => {
        if (!this.map)
            return false;

        const width = this.viewportCanvas.clientWidth;
        const height = this.viewportCanvas.clientHeight;

        if (this.viewportCanvas.width !== width || this.viewportCanvas.height !== height) {

            this.viewportCanvas.width = width;
            this.viewportCanvas.height = height;

            for (const bufferCanvas of [this.bufferCanvas, this.backgroundTileBufferCanvas]) {
                bufferCanvas.width = width + this.map.tileWidth * 2 * this.scaleFactor;
                bufferCanvas.height = height + this.map.tileHeight * 2 * this.scaleFactor;
            }

            //When you resize a canvas, the 2d context resets its properties back to default. 
            this.viewportCanvasContext.imageSmoothingEnabled = false;
            this.bufferCanvasContext.imageSmoothingEnabled = false;
            this.backgroundTileBufferCanvasContext.imageSmoothingEnabled = false;


            return true;
        }
        return false;
    }

    /**
     * Abruptly positions the camera to the given coordinate. 
     * @param {number} x 
     * @param {number} y 
     */
    setCameraPosition = (x, y) => {
        this.cameraX = x;
        this.cameraY = y;
    }

    /**
     * Converts a Tile's ID as defined within its corresponding TileSheet to a pair of physical coordinates that
     * describe where the Tile's graphical representation exists within the underlying sprite sheet.
     * @param {number} localTileId The tile id within the tile sheet, not the global ID present in the map file.
     * @returns 
     */
    #getSpritesheetSourceCoordinates = (localTileId) => {
        const sourceX = localTileId % this.map.width * this.map.tileWidth;
        const sourceY = Math.floor(localTileId / this.map.width) * this.map.tileHeight;
        return { sourceX, sourceY };
    }


    /**
     * Renders a tile to a Canvas using it's CanvasContext. It is assumed that the Canvas being draw on
     * is a buffer canvas rather than the viewport canvas. 
     * @param {*} canvasContext 
     * @param {*} tileX 
     * @param {*} tileY 
     * @param {*} layerZ 
     */
    #renderTileToCanvasContext = (canvasContext, tileX, tileY, layerZ) => {

        const tileBufferMinTileX = Math.floor(this.cameraX - (this.getCanvasWidthInTiles() / 2) - 1);
        const tileBufferMinTileY = Math.floor(this.cameraY - (this.getCanvasHeightInTiles() / 2) - 1);

        const tile = this.map.getTileAtPosition(tileX, tileY, layerZ);

        const destinationX = (tileX - tileBufferMinTileX) * this.map.tileWidth * this.scaleFactor;
        const destinationY = (tileY - tileBufferMinTileY) * this.map.tileHeight * this.scaleFactor;

        const renderedTileWidth = this.map.tileWidth * this.scaleFactor;
        const renderedTileHeight = this.map.tileHeight * this.scaleFactor;

        if (layerZ === 0) {
            canvasContext.fillStyle = '#000';
            canvasContext.fillRect(destinationX, destinationY, renderedTileWidth, renderedTileHeight);

        }

        if (tile !== null) {
            const { sourceX, sourceY } = this.#getSpritesheetSourceCoordinates(tile.id);
            canvasContext.drawImage(tile.tileSet.image, sourceX, sourceY, this.map.tileWidth, this.map.tileHeight, destinationX, destinationY, renderedTileWidth, renderedTileHeight);

        }
    }

    /**
     * 
     * @param {*} canvasContext 
     * @param {number} xTileMin 
     * @param {number} xTileMax 
     * @param {number} yTileMin 
     * @param {*} yTileMax 
     * @param {*} zTileMin 
     * @param {*} zTileMax 
     */
    #renderTilesInRange = (canvasContext, xTileMin, xTileMax, yTileMin, yTileMax, zTileMin, zTileMax) => {
        for (let tileX = xTileMin; tileX <= xTileMax; tileX++) {
            for (let tileY = yTileMin; tileY <= yTileMax; tileY++) {
                for (let tileZ = zTileMin; tileZ <= zTileMax; tileZ++) {
                    this.#renderTileToCanvasContext(canvasContext, tileX, tileY, tileZ);
                }
            }
        }
    }

    /** Represents the tile coordinate of the tile farthest to the top-left of the buffer canvases used in this class. */
    #getBufferMinTilePosition = () => ({
        x: Math.floor(this.cameraX - (this.getCanvasWidthInTiles() / 2) - 1),
        y: Math.floor(this.cameraY - (this.getCanvasHeightInTiles() / 2) - 1)
    });

    /** Represents the tile coordinate of the tile farthest to the bottom-right of the buffer canvases used in this class. */
    #getBufferMaxTilePosition = () => ({
        x: Math.floor(this.cameraX + this.getCanvasWidthInTiles() / 2 + 1),
        y: Math.floor(this.cameraY + this.getCanvasHeightInTiles() / 2 + 1)
    });

    /**
     * Renders every background tile that is within the bounds described by the background tile buffer to the background tile buffer
     */
    #renderAllBackgroundTiles = () => {
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        this.backgroundTileBufferCanvasContext.fillStyle = '#000';
        this.backgroundTileBufferCanvasContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        this.backgroundTileBufferCanvasContext.fillStyle = '#000';
        this.backgroundTileBufferCanvasContext.fillRect(0, 0, this.backgroundTileBufferCanvas.width, this.backgroundTileBufferCanvas.height);
        this.#renderTilesInRange(this.backgroundTileBufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);
    }

    /**
     * Invoked after the camera position has been moved and the only background tiles that
     * need to be rendered are the ones that were previously invisible. 
     * 
     * The background tiles are rendered to a
     */
    #renderNewlyVisibleBackgroundTiles = () => {

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();

        //1. Shift the existing contents around
        const deltaXInTiles = (bufferMinTileX - this.lastBufferMinTileX);
        const deltaYInTiles = (bufferMinTileY - this.lastBufferMinTileY);
        const deltaXInPixels = deltaXInTiles * this.map.tileWidth * this.scaleFactor;
        const deltaYInPixels = deltaYInTiles * this.map.tileHeight * this.scaleFactor;
        
        this.backgroundTileBufferCanvasContext.drawImage(this.backgroundTileBufferCanvas, 0, 0, this.backgroundTileBufferCanvas.width, this.backgroundTileBufferCanvas.height, -deltaXInPixels, -deltaYInPixels, this.backgroundTileBufferCanvas.width, this.backgroundTileBufferCanvas.height);

        // Camera pans right
        if (deltaXInTiles > 0)
            this.#renderTilesInRange(this.backgroundTileBufferCanvasContext, bufferMaxTileX - deltaXInTiles, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);

        //Camera pans left
        if (deltaXInTiles < 0)
            this.#renderTilesInRange(this.backgroundTileBufferCanvasContext, bufferMinTileX, bufferMinTileX + Math.abs(deltaXInTiles), bufferMinTileY, bufferMaxTileX, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);


        //Camera pans up
        if (deltaYInTiles < 0)
            this.#renderTilesInRange(this.backgroundTileBufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMinTileY + Math.abs(deltaYInTiles), 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);

        //Camera pans down
        if (deltaYInTiles > 0)
            this.#renderTilesInRange(this.backgroundTileBufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMaxTileY - Math.abs(deltaYInTiles) - 1, bufferMaxTileY, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1)


    }

    #renderBuffersToViewport = () => {
        
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();

        const minVisibleTileX = this.cameraX - (this.getCanvasWidthInTiles() / 2);
        const minVisibleTileY = this.cameraY - (this.getCanvasHeightInTiles() / 2);

        const sourceX = (minVisibleTileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
        const sourceY = (minVisibleTileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;





        this.bufferCanvasContext.drawImage(this.backgroundTileBufferCanvas, 0, 0);


        this.viewportCanvasContext.fillStyle = '#000';
        //this.viewportCanvasContext.fillRect(0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        this.viewportCanvasContext.drawImage(this.bufferCanvas, sourceX, sourceY, this.viewportCanvas.width, this.viewportCanvas.height, 0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
    }

    /**
     * 
     * @param {number} timeMs 
     */
    render = (timeMs) => {

        this.frameTimeDelta = timeMs - this.currentFrameTimeMs;
        console.log(this.frameTimeDelta);
        this.currentFrameTimeMs = timeMs;

        if (!this.map)
            return;

        this.cameraPanner.onFrame();

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();

        const bufferHasShifted = bufferMinTileX !== this.lastBufferMinTileX || bufferMinTileY !== this.lastBufferMinTileY;


        // Pipeline stage 1: Render background tiles to buffer
        if (this.forceCompleteRerender) {
            this.#renderAllBackgroundTiles();
        } else if (bufferHasShifted) {
            this.#renderNewlyVisibleBackgroundTiles();
        }

        // Pipeline stage 2: Render entites

        // Pipeline stage 3: Render foreground

        // Piepline stage 4: Render tint

        // Pipeline stage 5: Render l

        this.#renderBuffersToViewport();

        this.lastBufferMinTileX = bufferMinTileX;
        this.lastBufferMinTileY = bufferMinTileY;
        this.forceCompleteRerender = false;

    }

    getCanvasWidthInTiles = () => {
        return this.viewportCanvas.clientWidth / this.map.tileWidth / this.scaleFactor;
    }

    getCanvasHeightInTiles = () => {
        return this.viewportCanvas.clientHeight / this.map.tileHeight / this.scaleFactor;
    }


}


export default new MapRenderer(0, 0);