export default class MapRendererConfig{

    mapRenderer;

    #scaleFactor = 1;
    #foregroundOpacity = 1;
    #showGridLines = false;
    #useImageSmoothing = false;

    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
    }

    get scaleFactor(){
        return this.#scaleFactor;
    }

    set scaleFactor(scaleFactor){
        this._scaleFactor = scaleFactor;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get foregroundOpacity(){
        return this.#foregroundOpacity;
    }

    set foregroundOpacity(foregroundOpacity){
        if(foregroundOpacity < 0 || foregroundOpacity > 1)
            throw new Error("The foreground opacity for a MapRenderConfig object must be >= 0 and <= 1")
        this._foregroundOpacity = foregroundOpacity;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get showGridLines(){
        return this.#showGridLines;
    }

    set showGridLines(showGridLines){
        this.mapRenderer.forceCompleteRerender = true;
        this.#showGridLines = showGridLines;
    }

    get useImageSmoothing(){
        return this.#useImageSmoothing;
    }

    set useImageSmoothing(useImageSmoothing){
        this.mapRenderer.forceCompleteRerender = true;
        this.#useImageSmoothing = useImageSmoothing;
    }

    get renderForeground(){
        return this.foregroundOpacity > 0;
    }

}