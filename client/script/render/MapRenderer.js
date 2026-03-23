import Map from "../level/Map.js";
import Tile from "../level/Tile.js";
import CameraPanner from "./CameraPanner.js";


export class MapRenderer {

    /** @type {Map} */
    _map;
    cameraX;
    cameraY;
    canvas;
    bufferCanvas;
    context;
    resizeObserver;

    lastBufferMinTileX = undefined;
    lastBufferMinTileY = undefined;


    scaleFactor = 0.5;
    initialized = false;

    /** @type {number} The timestamp when the current frame began rendering */
    currentFrameTimeMs = 0;
    
    /** @type {number} The time between when this frame started rendering and when the last frame started rendering */
    frameTimeDelta = 0;
    
    cameraPanner;

    
    set map(map){
        this._map = map;
        if(!this.initialzed) {
            this.initialize();
            this.initialized = true;
        }
        this.renderOnce(true);

    }

    get map(){
        return this._map;
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
        this.canvas = document.getElementById('tile-canvas');
        this.bufferCanvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.resizeObserver = new ResizeObserver(this.resizeObserverMethod);
        this.resizeObserver.observe(this.canvas);
        this.cameraPanner = new CameraPanner(this)
    }

    resizeObserverMethod = (entries) => {
        for (const entry of entries) {
            if (entry.target === this.canvas) {
                if (this.resizeCanvases()) {
                    this.renderOnce(true);
                }
            }
        }
    }

    //HWe have to somehow force the 'initial' render to occur again
    resizeCanvases = () => {
        if(!this.map)
            return;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.bufferCanvas.width = width + this.map.tileWidth * 2 * this.scaleFactor;
            this.bufferCanvas.height = height + this.map.tileHeight * 2 * this.scaleFactor;
            return true;
        }
        return false;
    }

    /**
     * Forces the canvases 
     */
    initialize = () => {
        this.resizeCanvases();
        requestAnimationFrame(this.renderLoop);
    }

    renderLoop = (timeMs) => {
        this.frameTimeDelta = timeMs - this.currentFrameTimeMs;
        this.currentFrameTimeMs = timeMs;
        this.renderOnce();
        requestAnimationFrame(this.renderLoop);
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
    getSpritesheetSourceCoordinates = (localTileId) => {
        const sourceX = localTileId % this.map.width * this.map.tileWidth;
        const sourceY = Math.floor(localTileId / this.map.width) * this.map.tileHeight;
        return { sourceX, sourceY };
    }

    /**
     * 
     * @param {Tile} tile
     * @param {CanvasRenderingContext2D} canvasContext 
     */
    renderTileToCanvasContext = (tile, canvasContext, destinationX, destinationY, layerZ) => {
        const renderedTileWidth = this.map.tileWidth * this.scaleFactor;
        const renderedTileHeight = this.map.tileHeight * this.scaleFactor;


        if (tile === null && layerZ === 0) {
            canvasContext.fillStyle = '#000';
            canvasContext.fillRect(destinationX, destinationY, renderedTileWidth, renderedTileHeight);

        }

        if (tile !== null) {
            const { sourceX, sourceY } = this.getSpritesheetSourceCoordinates(tile.id);
            
            canvasContext.drawImage(tile.tileSet.image, sourceX, sourceY, this.map.tileWidth, this.map.tileHeight, destinationX, destinationY, renderedTileWidth, renderedTileHeight);

        }
    }

    /**
     * Force the canvas to be completely repainted. Right now, only used when the canvas is resized to ensure content is repainted approprtaely. 
     * @param {boolean} forceCompleteRerender 
     */
    renderOnce = (forceCompleteRerender) => {

        this.cameraPanner.onFrame();

        const bufferMinTileX = Math.floor(this.cameraX - (this.getCanvasWidthInTiles() / 2) - 1);
        const bufferMinTileY = Math.floor(this.cameraY - (this.getCanvasHeightInTiles() / 2) - 1);

        const bufferMaxTileX = Math.floor(this.cameraX + this.getCanvasWidthInTiles() / 2 + 1);
        const bufferMaxTileY = Math.floor(this.cameraY + this.getCanvasHeightInTiles() / 2 + 1);


        const isInitialRender = this.lastBufferMinTileX === undefined || this.lastBufferMinTileY === undefined;
        const isBufferStale = bufferMinTileX !== this.lastBufferMinTileX || bufferMinTileY !== this.lastBufferMinTileY;

        const bufferContext = this.bufferCanvas.getContext('2d');
        bufferContext.imageSmoothingEnabled = false;

        if (isInitialRender || forceCompleteRerender) {

            //TODO: Render real game tiles, not colored squares.

            bufferContext.fillStyle = '#000';
            bufferContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

            for (let tileX = bufferMinTileX; tileX <= bufferMaxTileX; tileX++) {
                for (let tileY = bufferMinTileY; tileY <= bufferMaxTileY; tileY++) {
                    for (let tileZ = 0; tileZ < this.map.layers.length; tileZ++) {

                        /** @type {Tile} */
                        const tile = this.map.getTileAtPosition(tileX, tileY, tileZ);
                        if (tile === null)
                            continue;

                        const destinationX = (tileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
                        const destinationY = (tileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;

                        this.renderTileToCanvasContext(tile, bufferContext, destinationX, destinationY, tileZ);

                    }
                }
            }


        } else if (isBufferStale) {

            //1. Shift the existing contents around
            const deltaXInTiles = (bufferMinTileX - this.lastBufferMinTileX);
            const deltaYInTiles = (bufferMinTileY - this.lastBufferMinTileY);
            const deltaXInPixels = deltaXInTiles * this.map.tileWidth * this.scaleFactor;
            const deltaYInPixels = deltaYInTiles * this.map.tileHeight * this.scaleFactor;
            bufferContext.drawImage(this.bufferCanvas, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height, -deltaXInPixels, -deltaYInPixels, this.bufferCanvas.width, this.bufferCanvas.height);


            // Camera pans right
            if (deltaXInTiles > 0) {
                for (let tileX = bufferMaxTileX - deltaXInTiles; tileX <= bufferMaxTileX; tileX++) {
                    for (let tileY = bufferMinTileY; tileY <= bufferMaxTileY; tileY++) {
                        for (let tileZ = 0; tileZ < this.map.layers.length; tileZ++) {
                            const tile = this.map.getTileAtPosition(tileX, tileY, tileZ);
                            const destinationX = (tileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
                            const destinationY = (tileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;
                            this.renderTileToCanvasContext(tile, bufferContext, destinationX, destinationY, tileZ);
                        }
                    }

                }
            }

            //Camera pans left
            if (deltaXInTiles < 0) {
                for (let tileX = bufferMinTileX; tileX <= bufferMinTileX + Math.abs(deltaXInTiles); tileX++) {
                    for (let tileY = bufferMinTileY; tileY <= bufferMaxTileY; tileY++) {
                        for (let tileZ = 0; tileZ < this.map.layers.length; tileZ++) {
                            const tile = this.map.getTileAtPosition(tileX, tileY, tileZ);
                            const destinationX = (tileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
                            const destinationY = (tileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;
                            this.renderTileToCanvasContext(tile, bufferContext, destinationX, destinationY, tileZ);
                        }
                    }
                }
            }

            //Camera pans up
            if (deltaYInTiles < 0) {
                for (let tileX = bufferMinTileX; tileX <= bufferMaxTileX; tileX++) {
                    for (let tileY = bufferMinTileY; tileY <= bufferMinTileY + Math.abs(deltaYInTiles); tileY++) {
                        for (let tileZ = 0; tileZ < this.map.layers.length; tileZ++) {
                            /** @type {Tile} */
                            const tile = this.map.getTileAtPosition(tileX, tileY, tileZ);
                            const destinationX = (tileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
                            const destinationY = (tileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;
                            this.renderTileToCanvasContext(tile, bufferContext, destinationX, destinationY, tileZ);
                        }
                    }
                }
            }

            //Camera pans down
            if (deltaYInTiles > 0) {
                for (let tileX = bufferMinTileX; tileX <= bufferMaxTileX; tileX++) {

                    for (let tileY = bufferMaxTileY - Math.abs(deltaYInTiles * 2); tileY <= bufferMaxTileY; tileY++) {
                        for (let tileZ = 0; tileZ < this.map.layers.length; tileZ++) {
                            /** @type {Tile} */
                            const tile = this.map.getTileAtPosition(tileX, tileY, tileZ);
                            const destinationX = (tileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
                            const destinationY = (tileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;
                            //alert(destinationY + " "  + this.bufferCanvas.height + " " + deltaYInTiles);
                            this.renderTileToCanvasContext(tile, bufferContext, destinationX, destinationY, tileZ);
                        }
                    }
                }
            }
        }


        const minVisibleTileX = this.cameraX - (this.getCanvasWidthInTiles() / 2);
        const minVisibleTileY = this.cameraY - (this.getCanvasHeightInTiles() / 2);

        const sourceX = (minVisibleTileX - bufferMinTileX) * this.map.tileWidth * this.scaleFactor;
        const sourceY = (minVisibleTileY - bufferMinTileY) * this.map.tileHeight * this.scaleFactor;


        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.bufferCanvas, sourceX, sourceY, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);

        this.lastBufferMinTileX = bufferMinTileX;
        this.lastBufferMinTileY = bufferMinTileY;

    }

    getCanvasWidthInTiles = () => {
        return this.canvas.clientWidth / this.map.tileWidth / this.scaleFactor;
    }

    getCanvasHeightInTiles = () => {
        return this.canvas.clientHeight / this.map.tileHeight / this.scaleFactor;
    }


}


export default new MapRenderer(0, 0);