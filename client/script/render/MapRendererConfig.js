export default class MapRendererConfig {

    mapRenderer;

    #scaleFactor = 1;
    #foregroundOpacity = 0.5;

    #useImageSmoothing = false;

    showTileOutlines = false;
    gridLineThickness = 1;
    gridLineStrokeStyle = 'black';

    highlightSelectedTile = true;
    highlightThickness = 1;
    highlightStrokeStyle = 'rgb(68, 143, 255)'

    /** @type {Boolean} */
    renderDebugMenu = true;

    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
    }

    get scaleFactor(){
        return this.#scaleFactor;
    }

    set scaleFactor(scaleFactor){
        this.#scaleFactor = scaleFactor;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get foregroundOpacity(){
        return this.#foregroundOpacity;
    }

    set foregroundOpacity(foregroundOpacity){
        if(foregroundOpacity < 0 || foregroundOpacity > 1)
            throw new Error("The foreground opacity for a MapRenderConfig object must be >= 0 and <= 1")
        this.#foregroundOpacity = foregroundOpacity;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get useImageSmoothing(){
        return this.#useImageSmoothing;
    }

    set useImageSmoothing(useImageSmoothing){
        this.mapRenderer.forceCompleteRerender = true;
        this.#useImageSmoothing = useImageSmoothing;
    }

    get renderForeground(){
        return this.#foregroundOpacity > 0;
    }

}