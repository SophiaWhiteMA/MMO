import entityManager from "../entity/EntityManager.js";
import Map from "../level/Map.js";
import { sendCommand } from "../network/index.js";
import Camera from "./Camera.js";
import MapRendererConfig from "./MapRendererConfig.js";


export class MapRenderer {

    /** @type {Map} */
    map;

    /** @type {HTMLCanvasElement} */
    viewportCanvas;

    /** @type {CanvasRenderingContext2D} */
    viewportCanvasContext;

    /** @type {HTMLCanvasElement} */
    bufferCanvas;

    /** @type {CanvasRenderingContext2D} */
    bufferCanvasContext;

    resizeObserver;

    /** @type {MapRendererConfig} */
    config;

    /** @type {number} The timestamp when the current frame began rendering */
    currentFrameTimeMs = 0;

    /** @type {number} The time between when this frame started rendering and when the last frame started rendering */
    frameTimeDelta = 0;

    /** @type {Camera} */
    camera;

    #averageFps = undefined;

    /** @type {Array<Number>} */
    #fpsEntries = [];

    /**
     * 
     * @param {Map} map 
     */
    setMap(map) {
        this.map = map;
        this.#resizeCanvases();
    }

    /**
     * 
     * @returns {Map}
     */
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

        this.camera = new Camera(this);

        this.camera.x = cameraX;
        this.camera.y = cameraY;

        // Primary canvas that is actually visible and shown on screen.
        this.viewportCanvas = document.getElementById('viewport-canvas');
        this.viewportCanvasContext = this.viewportCanvas.getContext('2d');

        // Canvas we write everything to before displaying it to the real canvas. Slightly bigger than viewport canvas. 
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvasContext = this.bufferCanvas.getContext('2d');

        this.resizeObserver = new ResizeObserver(this.#resizeObserverMethod);
        this.resizeObserver.observe(this.viewportCanvas);
        this.camera = new Camera(this);

    }

    #resizeObserverMethod = (entries) => {
        for (const entry of entries) {
            if (entry.target === this.viewportCanvas) {
                this.#resizeCanvases()
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
            this.viewportCanvasContext.imageSmoothingEnabled = this.config.useImageSmoothing;


            this.bufferCanvas.width = width + this.map.tileWidth * 2 * this.config.scaleFactor;
            this.bufferCanvas.height = height + this.map.tileHeight * 2 * this.config.scaleFactor;
            this.bufferCanvasContext.imageSmoothingEnabled = this.config.useImageSmoothing;

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
        this.camera.x = x;
        this.camera.y = y;
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

        const { x: tileBufferMinTileX, y: tileBufferMinTileY } = this.#getBufferMinTilePosition();

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
     * is the buffer canvas rather than the viewport canvas. 
     * @param {*} canvasContext 
     * @param {*} tileX 
     * @param {*} tileY 
     * @param {*} layerZ 
     */
    #renderTileToCanvasContext = (canvasContext, tileX, tileY, layerZ) => {

        const tileBufferMinTileX = Math.floor(this.camera.x - (this.getCanvasWidthInTiles() / 2) - 1);
        const tileBufferMinTileY = Math.floor(this.camera.y - (this.getCanvasHeightInTiles() / 2) - 1);


        const tile = this.map.getTileAtPosition(tileX, tileY, layerZ);

        const destinationX = (tileX - tileBufferMinTileX) * this.map.tileWidth * this.config.scaleFactor;
        const destinationY = (tileY - tileBufferMinTileY) * this.map.tileHeight * this.config.scaleFactor;

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

    /** Represents the tile coordinate of the tile farthest to the top-left of the buffer canvas */
    #getBufferMinTilePosition = () => ({
        x: Math.floor(this.camera.x - (this.getCanvasWidthInTiles() / 2) - 1),
        y: Math.floor(this.camera.y - (this.getCanvasHeightInTiles() / 2) - 1)
    });

    /** Represents the tile coordinate of the tile farthest to the bottom-right of the buffer canvas */
    #getBufferMaxTilePosition = () => ({
        x: Math.floor(this.camera.x + this.getCanvasWidthInTiles() / 2 + 1),
        y: Math.floor(this.camera.y + this.getCanvasHeightInTiles() / 2 + 1)
    });

    /**
     * Renders every background tile that is within the bounds described by the background tile buffer to the background tile buffer
     */
    #renderBackgroundTiles = () => {
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        this.#renderTilesInRange(this.bufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);
    }

    /**
     * Renders every background tile that is within the bounds described by the background tile buffer to the background tile buffer
     */
    #renderForegroundTiles = () => {
        if(!this.map?.minimumForegroundLayer || !this.config.renderForeground)
            return;
        this.bufferCanvasContext.save();
        this.bufferCanvasContext.globalAlpha = this.config.foregroundOpacity;
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        this.#renderTilesInRange(this.bufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, this.map.minimumForegroundLayer, this.map.layers.length - 1);
        this.bufferCanvasContext.restore();
    }

    #writeBufferToViewport = () => {

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();

        const minVisibleTileX = this.camera.x - (this.getCanvasWidthInTiles() / 2);
        const minVisibleTileY = this.camera.y - (this.getCanvasHeightInTiles() / 2);

        const sourceX = (minVisibleTileX - bufferMinTileX) * this.map.tileWidth * this.config.scaleFactor;;
        const sourceY = (minVisibleTileY - bufferMinTileY) * this.map.tileHeight * this.config.scaleFactor;;

        this.viewportCanvasContext.clearRect(0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        this.viewportCanvasContext.drawImage(this.bufferCanvas, sourceX, sourceY, this.viewportCanvas.width, this.viewportCanvas.height, 0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        this.bufferCanvasContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height)
    }

    #renderTileOutlines() {

        if (this.config.showTileOutlines)
            this.#renderGridLinesToCanvasContext(this.bufferCanvas);

        if (this.config.highlightSelectedTile && this.mouseX !== undefined && this.mouseY !== undefined) {

            const cameraPixelX = this.viewportCanvas.width / 2;
            const cameraPixelY = this.viewportCanvas.height / 2;

            const deltaPixelX = this.mouseX - cameraPixelX;
            const deltaPixelY = this.mouseY - cameraPixelY;

            const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
            const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

            const deltaTileX = deltaPixelX / renderedTileWidth;
            const deltaTileY = deltaPixelY / renderedTileHeight;

            const tileX = Math.floor(this.camera.x + deltaTileX);
            const tileY = Math.floor(this.camera.y + deltaTileY);

            this.#renderTileOutlineToBuffferCanvasContext(this.bufferCanvasContext, this.config.highlightStrokeStyle, this.config.highlightThickness, tileX, tileY);

        }
    }

    /**
     * Renders every background tile that is within the bounds described by the background tile buffer to the background tile buffer
     */
    #renderEntitiesToBuffer = (timeMs) => {
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        const entities = entityManager.getEntities();
        for (const e of entities) {

            const { x: visualX, y: visualY } = e.visualPosition;

            const isVisible = visualX >= bufferMinTileX && visualX <= bufferMaxTileX && visualY >= bufferMinTileY && visualY <= bufferMaxTileY;
            if (!isVisible)
                continue;

            const destinationX = Math.floor((visualX - bufferMinTileX) * this.map.tileWidth * this.config.scaleFactor);
            const destinationY = Math.floor((visualY - bufferMinTileY) * this.map.tileHeight * this.config.scaleFactor);
            e.drawToCanvasContext(this.bufferCanvasContext, destinationX, destinationY, this.config.scaleFactor);
        }

    }


    #calculateFps = (frameTimeDelta) => {

        if (this.#fpsEntries.length >= 60) {
            this.#fpsEntries.shift();
        }

        this.#fpsEntries.push(1000 / frameTimeDelta);

        if (this.#fpsEntries.length >= 60) {
            this.#averageFps = Math.round(this.#fpsEntries.reduce((p, c) => p + c, 0) / this.#fpsEntries.length);
        }

    }

    #renderDebugMenu = () => {

        if (!this.config.renderDebugMenu)
            return;

        this.viewportCanvasContext.save();

        const fontSize = 20;
        const lineHeight = 35; 
        const originX = 10;
        const originY = 10;

        this.viewportCanvasContext.font = `bold ${fontSize}px Arial`;
        this.viewportCanvasContext.fillStyle = '#f0f';
        this.viewportCanvasContext.textBaseline = 'top';

        const debugLines = [
            `FPS: ${this.#averageFps ?? 'Calculating...'}`,
            `Entity count: ${entityManager.getEntityCount()}`
        ];

        for(let i = 0; i < debugLines.length; i++) {
            const line = debugLines[i];
            this.viewportCanvasContext.fillText(line, originX, originY + (i * lineHeight));
        }

        this.viewportCanvasContext.restore();
    }

    /**
     * 
     * @param {number} timeMs 
     */
    render = (timeMs) => {

        entityManager.getEntities().forEach(e => e.updateVisualPosition(timeMs));

        const frameTimeDelta = timeMs - this.currentFrameTimeMs;
        this.currentFrameTimeMs = timeMs;

        this.#calculateFps(frameTimeDelta);

        if (!this.map)
            return;

        this.camera.onFrame();

        //Prep work: clear buffer prior to re-render
        this.bufferCanvasContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

        this.#renderBackgroundTiles();

        this.#renderEntitiesToBuffer(timeMs);

        this.#renderForegroundTiles();

        this.#renderTileOutlines();

        this.#writeBufferToViewport();

        // the positioning of the debug test is relative to the viewport, so we render it after copying the buffer to the viewport. 
        this.#renderDebugMenu();

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

    onMouseClick = (evt) => {

            const cameraPixelX = this.viewportCanvas.width / 2;
            const cameraPixelY = this.viewportCanvas.height / 2;

            const deltaPixelX = this.mouseX - cameraPixelX;
            const deltaPixelY = this.mouseY - cameraPixelY;

            const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
            const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

            const deltaTileX = deltaPixelX / renderedTileWidth;
            const deltaTileY = deltaPixelY / renderedTileHeight;

            const tileX = Math.floor(this.camera.x + deltaTileX);
            const tileY = Math.floor(this.camera.y + deltaTileY);
            
            sendCommand(`move ${tileX} ${tileY}`);
    }

}


/** @type {MapRenderer} */
const mapRenderer = new MapRenderer(0, 0);

export default mapRenderer;