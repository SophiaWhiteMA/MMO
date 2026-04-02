import entityManager from "../../entity/EntityManager.js";
import Map from "../../level/Map.js";
import { sendCommand } from "../../network/index.js";
import Camera from "./Camera.js";
import MapRendererConfig from "./MapRendererConfig.js";
import GameInterface from "../GameInterface.js";
import { chatInterface } from "../index.js";
import { move as playerMove} from "../../network/outbound/player.js";


export default class MapRenderer extends GameInterface {

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

    /** @type {MapRendererConfig} */
    config;

    /** @type {number} The timestamp when the current frame began rendering */
    currentFrameTimeMs = 0;

    /** @type {number} The time between when this frame started rendering and when the last frame started rendering */
    frameTimeDelta = 0;

    /** @type {Camera} */
    camera;


    /** @type {Boolean} */
    _isStale = true; //Superclass property; hard-coded value of true forces interface to render every frame
    
    /** @type {Boolean} */
    _closeable = false;

    /** @type {Number | undefined} */
    #averageFps = undefined;

    /** @type {Array<Number>} */
    #fpsEntries = [];

    /**
     * 
     * @param {Map} map 
     */
    setMap(map) {
        this.map = map;
        this.onWindowResize();
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
     * @param {GameInterface} parent 
     * @param {number} cameraX 
     * @param {number} cameraY 
     */
    constructor(parent, cameraX, cameraY) {
        super(parent);
        this.config = new MapRendererConfig(this);
        this.camera = new Camera(this, cameraX, cameraY);
        this.viewportCanvas = document.getElementById('viewport-canvas');
        this.viewportCanvasContext = this.viewportCanvas.getContext('2d');
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvasContext = this.bufferCanvas.getContext('2d');
    }


    /**
     * Superclass method. Triggers when global window is resized.
     * 
     */
    onWindowResize() {
        if (!this.map)
            return;

        const width = this.viewportCanvas.clientWidth;
        const height = this.viewportCanvas.clientHeight;

        this.viewportCanvas.width = width;
        this.viewportCanvas.height = height;
        this.viewportCanvasContext.imageSmoothingEnabled = this.config.useImageSmoothing;

        this.bufferCanvas.width = width + this.map.tileWidth * 2 * this.config.scaleFactor;
        this.bufferCanvas.height = height + this.map.tileHeight * 2 * this.config.scaleFactor;
        this.bufferCanvasContext.imageSmoothingEnabled = this.config.useImageSmoothing;

    }

    /**
     * Renders the outline of a tile to the buffer canvas context provided tile coordinates and styling information as input.
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
     * Renders tile outlines to the context of the buffer canvas for *every* visible tile
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
     * Locates and renders the tile found at (tileX, tileY, tileZ) of the currently loaded map
     * using the context of the buffer canvas. 
     * @param {*} canvasContext 
     * @param {*} tileX 
     * @param {*} tileY 
     * @param {*} layerZ 
     */
    #renderTileToBufferCanvasContext(canvasContext, tileX, tileY, layerZ) {
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
     * @param {CanvasRenderingContext2D} canvasContext 
     * @param {number} xTileMin 
     * @param {Number} xTileMax 
     * @param {number} yTileMin 
     * @param {Number} yTileMax 
     * @param {Number} zTileMin 
     * @param {Number} zTileMax 
     */
    #renderTilesInRange(canvasContext, xTileMin, xTileMax, yTileMin, yTileMax, zTileMin, zTileMax) {
        for (let tileX = xTileMin; tileX <= xTileMax; tileX++) {
            for (let tileY = yTileMin; tileY <= yTileMax; tileY++) {
                for (let tileZ = zTileMin; tileZ <= zTileMax; tileZ++) {
                    this.#renderTileToBufferCanvasContext(canvasContext, tileX, tileY, tileZ);
                }
            }
        }
    }

    /**
     * Represents the tile coordinate of the tile farthest to the top-left of the buffer canvas
     * @returns {{x: Number, y: Number}}
     */
    #getBufferMinTilePosition() {
        return {
            x: Math.floor(this.camera.x - (this.getCanvasWidthInTiles() / 2) - 1),
            y: Math.floor(this.camera.y - (this.getCanvasHeightInTiles() / 2) - 1)
        }
    };

    /**
     * Represents the tile coordinate of the tile farthest to the bottom-right of the buffer canvas
     * @returns {{x: Number, y: Number}}
     */
    #getBufferMaxTilePosition() {
        return {
            x: Math.floor(this.camera.x + this.getCanvasWidthInTiles() / 2 + 1),
            y: Math.floor(this.camera.y + this.getCanvasHeightInTiles() / 2 + 1)
        }
    }

    /**
     * Renders every background tile that is within the bounds of the buffer canvas to said canvas
     */
    #renderBackgroundTiles() {
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        this.#renderTilesInRange(this.bufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, 0, (this.map?.minimumForegroundLayer ?? this.map.layers.length) - 1);
    }

    /**
     * Renders every foreground tile that is within the bounds of the buffer canvas to said canvas
     */
    #renderForegroundTiles() {
        if (!this.map?.minimumForegroundLayer || !this.config.renderForeground)
            return;
        this.bufferCanvasContext.save();
        this.bufferCanvasContext.globalAlpha = this.config.foregroundOpacity;
        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        this.#renderTilesInRange(this.bufferCanvasContext, bufferMinTileX, bufferMaxTileX, bufferMinTileY, bufferMaxTileY, this.map.minimumForegroundLayer, this.map.layers.length - 1);
        this.bufferCanvasContext.restore();
    }

    #writeBufferToViewport() {

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();

        const minVisibleTileX = this.camera.x - (this.getCanvasWidthInTiles() / 2);
        const minVisibleTileY = this.camera.y - (this.getCanvasHeightInTiles() / 2);

        const sourceX = (minVisibleTileX - bufferMinTileX) * this.map.tileWidth * this.config.scaleFactor;
        const sourceY = (minVisibleTileY - bufferMinTileY) * this.map.tileHeight * this.config.scaleFactor;

        this.viewportCanvasContext.clearRect(0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        this.viewportCanvasContext.drawImage(this.bufferCanvas, sourceX, sourceY, this.viewportCanvas.width, this.viewportCanvas.height, 0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        this.bufferCanvasContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height)
    }

    #renderTileOutlines() {

        if (this.config.showTileOutlines)
            this.#renderGridLinesToCanvasContext(this.bufferCanvas);

        if (this.config.highlightSelectedTile && this._mouseX !== undefined && this._mouseY !== undefined) {

            const cameraPixelX = this.viewportCanvas.width / 2;
            const cameraPixelY = this.viewportCanvas.height / 2;

            const deltaPixelX = this._mouseX - cameraPixelX;
            const deltaPixelY = this._mouseY - cameraPixelY;

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
    #renderEntitiesToBuffer() {
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


    #calculateFps(frameTimeDelta) {

        if (this.#fpsEntries.length >= 60) {
            this.#fpsEntries.shift();
        }

        this.#fpsEntries.push(1000 / frameTimeDelta);

        if (this.#fpsEntries.length >= 60) {
            this.#averageFps = Math.round(this.#fpsEntries.reduce((p, c) => p + c, 0) / this.#fpsEntries.length);
        }

    }

    #renderDebugMenu() {

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

        for (let i = 0; i < debugLines.length; i++) {
            const line = debugLines[i];
            this.viewportCanvasContext.fillText(line, originX, originY + (i * lineHeight));
        }

        this.viewportCanvasContext.restore();
    }

    #renderPlayerNames() {

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();
        const entities = entityManager.getEntities();

        const fontSize = 14 * this.config.scaleFactor;
        this.bufferCanvasContext.save();
        this.bufferCanvasContext.font = `bold ${fontSize}px Arial`;
        this.bufferCanvasContext.fillStyle = '#f0f';
        this.bufferCanvasContext.textAlign = "center";
        this.bufferCanvasContext.textBaseline = "top";

        for (const e of entities) {

            const { x: visualX, y: visualY } = e.visualPosition;

            const isVisible = visualX >= bufferMinTileX && visualX <= bufferMaxTileX && visualY >= bufferMinTileY && visualY <= bufferMaxTileY;
            if (!isVisible)
                continue;

            const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
            const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

            const destinationX = Math.floor((visualX - bufferMinTileX) * renderedTileWidth) + 0.5 * renderedTileWidth;
            const destinationY = Math.floor((visualY - bufferMinTileY) * renderedTileHeight) + renderedTileHeight + 5;

            this.bufferCanvasContext.fillText(e.name, destinationX, destinationY);

        }

        this.bufferCanvasContext.restore();

    }

    #renderChatMessages() {

        const now = new Date();
        const recentChatMessages = chatInterface.chatMessages.filter(e => (now.valueOf() - e.timeStamp.valueOf()) <= e.duration);

        if(recentChatMessages.length <= 0)
            return;

        const fontSize = 14 * this.config.scaleFactor;
        this.bufferCanvasContext.save();
        this.bufferCanvasContext.font = `bold ${fontSize}px Arial`;
        this.bufferCanvasContext.fillStyle = 'yellow';
        this.bufferCanvasContext.textAlign = "center";
        this.bufferCanvasContext.strokeStyle = 'black';
        this.bufferCanvasContext.lineWidth = fontSize / 8;

        const { x: bufferMinTileX, y: bufferMinTileY } = this.#getBufferMinTilePosition();
        const { x: bufferMaxTileX, y: bufferMaxTileY } = this.#getBufferMaxTilePosition();

        // Every time we render a chat message, we store the current (visual) position of the entity
        // that authored it here. We use this to track how many chat messages originated from each location
        // allowing us to visually stagger messages when more than one message originates from the same position
        const chatMessagePositions = [];

        for (const chatMessage of recentChatMessages) {

            const author = entityManager.getEntityById(chatMessage.entityId);
            if (!author)
                continue;

            const { x: visualX, y: visualY } = author.visualPosition;
            const isVisible = visualX >= bufferMinTileX && visualX <= bufferMaxTileX && visualY >= bufferMinTileY && visualY <= bufferMaxTileY;
            if (!isVisible)
                continue;

            const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
            const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

            const existingPositions = chatMessagePositions.filter(e => e.x == visualX && e.y == visualY);
            if (existingPositions.length >= 5)
                continue;

            const textMetrics = this.bufferCanvasContext.measureText(chatMessage.content);
            const destinationX = Math.floor((visualX - bufferMinTileX) * renderedTileWidth) + 0.5 * renderedTileWidth;
            const destinationY = Math.floor((visualY - bufferMinTileY) * renderedTileHeight) - renderedTileHeight - 5 - (existingPositions.length * (textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent) * 1.5);

            this.bufferCanvasContext.strokeText(chatMessage.content, destinationX, destinationY);
            this.bufferCanvasContext.fillText(chatMessage.content, destinationX, destinationY);
            chatMessagePositions.push({ x: visualX, y: visualY })

        }

        this.bufferCanvasContext.restore();

    }

    /**
     * 
     * @param {number} timeMs 
     */
    render(timeMs) {

        entityManager.getEntities().forEach(e => e.updateVisualPosition(timeMs)); //Should this really be in the render loop? 

        if (!this.map)
            return;

        //Prep work: clear buffer prior to re-render
        this.bufferCanvasContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        this.#renderBackgroundTiles();
        this.#renderEntitiesToBuffer();
        this.#renderForegroundTiles();
        this.#renderTileOutlines();
        this.#renderPlayerNames();
        this.#renderChatMessages();
        this.#writeBufferToViewport();

        const frameTimeDelta = timeMs - this.currentFrameTimeMs;
        this.currentFrameTimeMs = timeMs;
        this.#calculateFps(frameTimeDelta);
        this.#renderDebugMenu();  // the positioning of the debug menu is relative to the viewport, so we render it after copying the buffer to the viewport. 

    }

    getCanvasWidthInTiles() {
        return this.viewportCanvas.clientWidth / this.map.tileWidth / this.config.scaleFactor;
    }

    getCanvasHeightInTiles() {
        return this.viewportCanvas.clientHeight / this.map.tileHeight / this.config.scaleFactor;
    }



    /**
     * 
     * @param {PointerEvent} evt 
     */
    onMouseClick(evt) {
        super.onMouseClick(evt);
        this.getParent().setActiveChild(this);

        const cameraPixelX = this.viewportCanvas.width / 2;
        const cameraPixelY = this.viewportCanvas.height / 2;

        const deltaPixelX = this._mouseX - cameraPixelX;
        const deltaPixelY = this._mouseY - cameraPixelY;

        const renderedTileWidth = this.map.tileWidth * this.config.scaleFactor;
        const renderedTileHeight = this.map.tileHeight * this.config.scaleFactor;

        const deltaTileX = deltaPixelX / renderedTileWidth;
        const deltaTileY = deltaPixelY / renderedTileHeight;

        const tileX = Math.floor(this.camera.x + deltaTileX);
        const tileY = Math.floor(this.camera.y + deltaTileY);

        playerMove(tileX, tileY);
    }

    /**
     * 
     * @param {WheelEvent} evt 
     * @returns 
     */
    onWheel(evt) {
        const minScaleFactor = 0.25;
        const maxScaleFactor = 8;
        const fraction = evt.deltaY > 0 ? 0.5 : 2;
        const newScaleFactor = this.config.scaleFactor * fraction;
        if (newScaleFactor > maxScaleFactor || newScaleFactor < minScaleFactor)
            return;
        this.config.scaleFactor *= fraction;
        this.onWindowResize();

    }

    /**
     * 
     * @param {PointerEvent} evt 
     */
    onContextMenu(evt) {
        evt.preventDefault();
    }


    getHtmlElement() {
        return document.getElementById('viewport-canvas');
    }



}
