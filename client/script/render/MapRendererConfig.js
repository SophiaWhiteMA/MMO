export default class MapRendererConfig{

    mapRenderer;

    _scaleFactor = 1;
    _foregroundOpacity = 1;
    _showGridLines = false;
    _useImageSmoothing = false;

    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
    }

    get scaleFactor(){
        return this._scaleFactor;
    }

    set scaleFactor(scaleFactor){
        this._scaleFactor = scaleFactor;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get foregroundOpacity(){
        return this._foregroundOpacity;
    }

    set foregroundOpacity(foregroundOpacity){
        if(foregroundOpacity < 0 || foregroundOpacity > 1)
            throw new Error("The foreground opacity for a MapRenderConfig object must be >= 0 and <= 1")
        this._foregroundOpacity = foregroundOpacity;
        this.mapRenderer.forceCompleteRerender = true;
    }

    get showGridLines(){
        return this._showGridLines;
    }

    set showGridLines(showGridLines){
        this.mapRenderer.forceCompleteRerender = true;
        this._showGridLines = showGridLines;
    }

    get useImageSmoothing(){
        return this._useImageSmoothing;
    }

    set useImageSmoothing(useImageSmoothing){
        this.mapRenderer.forceCompleteRerender = true;
        this._useImageSmoothing = useImageSmoothing;
    }

    get renderForeground(){
        return this.foregroundOpacity > 0;
    }

}