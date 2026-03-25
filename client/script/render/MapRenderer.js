import Map from "../level/Map.js";
import CameraPanner from "./CameraPanner.js";
import MapRendererConfig from "./MapRendererConfig.js";


export class MapRenderer {

    /** @type {Map} */
    map;
    cameraX;
    cameraY;

    viewportCanvas;
    viewportCanvasContext;

    bufferCanvas;
    bufferCanvasContext;

    tileOutlineBufferCanvas;
    tileOutlineBufferCanvasContext;

    backgroundTileBufferCanvas;
    backgroundTileBufferCanvasContext;

    resizeObserver;

    lastBufferMinTileX = undefined;
    lastBufferMinTileY = undefined;

    /** @type {MapRendererConfig} */
    config;

    /** @type {boolean} Variable used to track whether or not a complete re-render is required. */
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

        this.config = new MapRendererConfig(this);

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

        this.tileOutlineBufferCanvas = document.createElement('canvas');
        this.tileOutlineBufferCanvasContext = this.tileOutlineBufferCanvas.getContext('2d');

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

            for (const bufferCanvas of [this.bufferCanvas, this.backgroundTileBufferCanvas, this.tileOutlineBufferCanvas]) {
                bufferCanvas.width = width + this.map.tileWidth * 2 * this.config.scaleFactor;;
                bufferCanvas.height = height + this.map.tileHeight * 2 * this.config.scaleFactor;;
            }

            //When you resize a canvas, the 2d context resets its properties back to default. 
            for (const canvasContext of [this.viewportCanvasContext, this.bufferCanvasContext, this.tileOutlineBufferCanvasContext, this.backgroundTileBufferCanvasContext]) {
                canvasContext.imageSmoothingEnabled = this.config.useImageSmoothing;
            }

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
     * Renders the outline of a tile to a canvas context. 
     * @param {CanvasRenderingContext2D} canvasContext 
     * @param {string} strokeStyle 
     * @param {string} lineWidth 
     * @param {number} tileX 
     * @param {number} tileY 
     */
    #renderTileOutlineToBuffferCanvasContext(canvasContext, strokeStyle, lineWidth, tileX, tileY) {
        canvasContext.strokeStyle = strokeStyle;
        canvasContext.lineWidth = lineWidth;

        const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
        const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

        const {x: tileBufferMinTileX, y: tileBufferMinTileY } = this.#getBufferMinTilePosition();

        const x = Math.floor(tileX - tileBufferMinTileX) * renderedTileWidth;
        const y = Math.floor(tileY - tileBufferMinTileY) * renderedTileHeight;
        canvasContext.strokeRect(x, y, renderedTileWidth, renderedTileHeight);
    }

    /**
     * Renders tile outlines to a canvas context for *every* visible tile
     * @param {CanvasRenderingContext2D} canvasContext 
     */
    #renderGridLinesToCanvasContext(canvasContext) {
        const { x: tileBufferMinTileX, y: tileBufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: tileBufferMaxTileX, y: tileBufferMaxTileY } = this.#getBufferMaxTilePosition();
        for (let x = tileBufferMinTileX; x <= tileBufferMaxTileX; x++) {
            for (let y = tileBufferMinTileY; y <= tileBufferMaxTileY; y++) {
                this.#renderTileOutlineToBuffferCanvasContext(canvasContext, this.config.gridLineStrokeStyle, this.config.gridLineThickness, x, y);
            }
        }
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

        const destinationX = (tileX - tileBufferMinTileX) * this.map.tileWidth * this.config.scaleFactor;;
        const destinationY = (tileY - tileBufferMinTileY) * this.map.tileHeight * this.config.scaleFactor;;

        const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
        const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

        if (layerZ === 0) {
            canvasContext.fillStyle = '#000';
            canvasContext.fillRect(destinationX, destinationY, renderedTileWidth, renderedTileHeight);
        }

        if (tile !== null) {
            const { x: spriteSheetX, y: spriteSheetY } = tile.tileSet.spriteSheet.getSpriteSheetCoordinates(tile.id);
            tile.tileSet.spriteSheet.drawToCanvasContext(canvasContext, spriteSheetX, spriteSheetY, destinationX, destinationY, this.config.scaleFactor);
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
        const deltaXInPixels = deltaXInTiles * this.map.tileWidth * this.config.scaleFactor;;
        const deltaYInPixels = deltaYInTiles * this.map.tileHeight * this.config.scaleFactor;;

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

    #writeBuffersToViewport = () => {

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();

        const minVisibleTileX = this.cameraX - (this.getCanvasWidthInTiles() / 2);
        const minVisibleTileY = this.cameraY - (this.getCanvasHeightInTiles() / 2);

        const sourceX = (minVisibleTileX - bufferMinTileX) * this.map.tileWidth * this.config.scaleFactor;;
        const sourceY = (minVisibleTileY - bufferMinTileY) * this.map.tileHeight * this.config.scaleFactor;;

        this.bufferCanvasContext.drawImage(this.backgroundTileBufferCanvas, 0, 0);
        this.bufferCanvasContext.drawImage(this.tileOutlineBufferCanvas, 0, 0);

        this.viewportCanvasContext.fillStyle = '#000';
        this.viewportCanvasContext.fillRect(0, 0, this.viewportCanvas.width, this.viewportCanvas.height);

        this.viewportCanvasContext.drawImage(this.bufferCanvas, sourceX, sourceY, this.viewportCanvas.width, this.viewportCanvas.height, 0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
    }

    #renderTileOutlines() {

        this.tileOutlineBufferCanvasContext.clearRect(0, 0, this.tileOutlineBufferCanvas.width, this.tileOutlineBufferCanvas.height);

        if (this.config.showTileOutlines)
            this.#renderGridLinesToCanvasContext(this.tileOutlineBufferCanvasContext);

        if (this.config.highlightSelectedTile && this.mouseX !== undefined && this.mouseY !== undefined) {

            const cameraPixelX = this.viewportCanvas.width / 2;
            const cameraPixelY = this.viewportCanvas.height / 2;

            const deltaPixelX = this.mouseX - cameraPixelX;
            const deltaPixelY = this.mouseY - cameraPixelY;

            const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
            const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

            const deltaTileX = deltaPixelX / renderedTileWidth;
            const deltaTileY = deltaPixelY / renderedTileHeight;

            const tileX = Math.floor(this.cameraX + deltaTileX);
            const tileY = Math.floor(this.cameraY + deltaTileY);

            this.#renderTileOutlineToBuffferCanvasContext(this.tileOutlineBufferCanvasContext, this.config.highlightStrokeStyle, this.config.highlightThickness, tileX, tileY);

        }
    }

    /**
     * 
     * @param {number} timeMs 
     */
    render = (timeMs) => {

        this.frameTimeDelta = timeMs - this.currentFrameTimeMs;
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

        //Pipeline stage 4: render tile outlines
        this.#renderTileOutlines();

        // Piepline stage 4: Render lighting
        this.#writeBuffersToViewport();

        this.lastBufferMinTileX = bufferMinTileX;
        this.lastBufferMinTileY = bufferMinTileY;
        this.forceCompleteRerender = false;

    }

    getCanvasWidthInTiles = () => {
        return this.viewportCanvas.clientWidth / this.map.tileWidth / this.config.scaleFactor;
    }

    getCanvasHeightInTiles = () => {
        return this.viewportCanvas.clientHeight / this.map.tileHeight / this.config.scaleFactor;
    }

    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseMove = (evt) => {
        const { clientX, clientY } = evt;
        const rect = this.viewportCanvas.getBoundingClientRect();
        const canvasPixelX = clientX - rect.left;
        const canvasPixelY = clientY - rect.top;

        this.mouseX = canvasPixelX;
        this.mouseY = canvasPixelY;

    }

    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseLeave = (evt) => {
        //TODO: This is a little hacky, no? 
        this.mouseX = -100;
        this.mouseY = -100;
    }

}


export default new MapRenderer(0, 0);