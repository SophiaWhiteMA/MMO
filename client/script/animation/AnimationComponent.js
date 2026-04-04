import TextureSheet from "../assets/TextureSheet.js";

export default class AnimationComponent {

    /** @type {String} */
    name;


    /** @type {AnimationComponent} */
    _parent;

    /** @type {Array<AnimationComponent} */
    _children = [];

    /** Measured in radians  @type {Number} */
    angle;

    /** Measured in radians @type {Number} */
    defaultAngle;

    /**
     * Position of this AnimationComponent relative to either its parent if defined,
     * or the proided canvas coordinates for a root-level component 
     *  @type {{x: Number, y: Number}}
     */
    position;

    /** @type {{x: Number, y: Number}} */
    defaultPosition;

    /** @type {{x: Number, y: Number}} */
    pivotPoint;

    /** @type {TextureSheet} */
    textureSheet;

    /** @type {{x: Number, y: Number}} */
    textureSheetPosition;
    
    zIndex = 0;

    scaleFactor = 1;

    /**
     * Size of component in pixels at scale factor = 1
     * @type {{width: Number, height: Number}}
     */
    size;

    /**
     * 
     * @param {Number} defaultAngle 
     * @param {{x: Number, y: Number}} defaultPosition
     * @param {{x: Number, y: Number}} pivotPoint
     * @param {TextureSheet} textureSheet
     * @param {{x: Number, y: Number}} textureSheetPosition
     * @param {{width: Number, height: Number}} size
     */
    constructor(name, defaultAngle, defaultPosition, pivotPoint, textureSheet, textureSheetPosition, size) {
        this.name = name;
        this.defaultAngle = defaultAngle;
        this.defaultPosition = defaultPosition;
        this.angle = defaultAngle;
        this.position = {...defaultPosition};
        this.pivotPoint = pivotPoint;
        this.textureSheet = textureSheet;
        this.textureSheetPosition = textureSheetPosition;
        this.size = size;
    }
    
    /**
     * Renders this AnimationComponent at its children to a canvas context at the provided destination coordinates.
     * @param {CanvasRenderingContext2D} canvasContext 
     * @param {Number} destinationX
     * @param {Number} destinationY
     * @param {Number} scaleFactor
     */
    render(canvasContext, destinationX, destinationY, scaleFactor){


        const allComponents = [this, ...this.getAllChildren()].sort((a, b) => a.zIndex - b.zIndex);

        canvasContext.save();

        if(!this.getParent())
            canvasContext.translate(destinationX, destinationY);

        for(const component of allComponents) {
            
            canvasContext.save();

            const relativePosition = component.getPositionRelativeToRoot();
            const relativeAngle = component.getAngleRelativeToRoot();

            canvasContext.translate(relativePosition.x * scaleFactor, relativePosition.y * scaleFactor);
            canvasContext.rotate(relativeAngle)

            component.textureSheet.drawToCanvasContext(
                canvasContext,
                component.textureSheetPosition.x,
                component.textureSheetPosition.y,
                component.size.width,
                component.size.height,
                -(component.pivotPoint.x * scaleFactor * component.scaleFactor),
                -(component.pivotPoint.y * scaleFactor * component.scaleFactor),
                scaleFactor * component.scaleFactor
            );

            canvasContext.restore();
        }

        canvasContext.restore();

        return;

        canvasContext.save();

        if(!this.getParent())
            canvasContext.translate(destinationX, destinationY);

        canvasContext.translate(this.position.x * scaleFactor, this.position.y * scaleFactor);
        canvasContext.rotate(this.angle + this.defaultAngle)

        // Call children first for reverse-order breadth-first execution. 
        for(const child of this._children) {
            child.render(canvasContext, destinationX, destinationY, scaleFactor);
        }

        this.textureSheet.drawToCanvasContext(
            canvasContext,
            this.textureSheetPosition.x,
            this.textureSheetPosition.y,
            this.size.width,
            this.size.height,
            -(this.pivotPoint.x * scaleFactor),
            -(this.pivotPoint.y * scaleFactor),
            scaleFactor
        );


        canvasContext.restore();
    }

    /**
     * 
     * @param {AmimationComponent} child 
     */
    addChild(child){
        this._children.push(child);
        child.setParent(this);
    }

    /**
     * 
     * @param {AnimationComponent} parent 
     */
    setParent(parent){
        this._parent = parent;
    }

    /**
     * @returns {AnimationComponent}
     */
    getParent(){
        return this._parent;
    }

    /** Restores the position and angle back to the default value and applies the operation to all children as well */
    reset(){
        this.position = {...this.defaultPosition};
        this.angle = this.defaultAngle;
        this.scaleFactor = 1;
    }

    rotate(radians){
        this.angle += radians;
    }


    translate(x, y){
        this.position = {x: this.position.x + x, y: this.position.y + y};
    }

    getChildren(){
        return this._children;
    }

    getAllChildren(){
        const output = [];
        for(const child of this.getChildren()) {
            output.push(child);
            output.push(...child.getAllChildren());
        }
        return output;
    }

    getPositionRelativeToRoot() {
        // 1. Build a list of ancestors from Root down to this component
        const chain = [];
        let current = this.getParent();
        while (current) {
            chain.unshift(current); // Adds to the beginning of the array
            current = current.getParent();
        }

        let worldX = 0;
        let worldY = 0;
        let worldAngle = 0;

        // 2. Walk DOWN the chain (Root -> Thigh -> Shin -> Foot)
        for (const member of chain) {
            const cos = Math.cos(worldAngle);
            const sin = Math.sin(worldAngle);

            // Rotate the parent's local position by the current world angle
            worldX += member.position.x * cos - member.position.y * sin;
            worldY += member.position.x * sin + member.position.y * cos;

            // Add this parent's angle to the world angle for the next child
            worldAngle += member.angle;
        }

        // 3. Finally, add THIS component's offset rotated by the final worldAngle
        const finalCos = Math.cos(worldAngle);
        const finalSin = Math.sin(worldAngle);

        return {
            x: worldX + (this.position.x * finalCos - this.position.y * finalSin),
            y: worldY + (this.position.x * finalSin + this.position.y * finalCos)
        };
    }

    getAngleRelativeToRoot() {
        let output = this.angle;
        let p = this.getParent();
        while(p) {
            output += p.angle;
            p = p.getParent();
        }
        return output;
    }

    /**
     * 
     * @param {String} name 
     * @returns {AnimationComponent}
     */
    get(name){
        for(const component of [this, ...this.getAllChildren()]) {
            if(component.name.toLowerCase() === name.toLowerCase())
                return component
        }
        return null;
    }

}