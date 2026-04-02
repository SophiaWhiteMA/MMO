import GameInterface from "./GameInterface.js";

const RESIZE_MARGIN = 10;

export default class WindowInterface extends GameInterface {

    _htmlElement;

    _closeable = true;

    _title = 'Untitled Interface';

    /** @type {'NONE' | 'EAST' | 'SOUTHEAST' | 'SOUTH'} */
    _resizeMode = 'NONE';
    someField = Math.random();

    /** @type {HTMLElement} */
    body;

    barLastClicked = 0;

    set title(title){
        this._title = title;
        if(this.dragBar) {
            this.dragBar.getElementsByClassName('title')[0].innerText = title;
        }
    }


    /**
     * 
     * @param {GameInterface} parent 
     */
    constructor(parent) {

        super(parent);

        const htmlElement = this.getHtmlElement();
        const defaultPosition = this.getDefaultPosition();
        htmlElement.style.top = `${defaultPosition.x}px`;
        htmlElement.style.left = `${defaultPosition.y}px`;

        this.dragBar = document.createElement('div');
        this.dragBar.classList.add('draggable-interface-bar');
        
        const titleElement = document.createElement('span');
        titleElement.classList.add('title');

        this.closeButton = document.createElement('button');
        this.closeButton.innerText = 'X';
        this.closeButton.classList.add('draggable-interface-close-button')
        this.closeButton.onclick = () => this.close();

        this.dragBar.append(titleElement);
        this.dragBar.append(this.closeButton);

        this.body = document.createElement('div');
        this.body.classList.add('draggable-interface-body');

        htmlElement.append(this.dragBar);
        htmlElement.append(this.body);

        if(parent.body) {
           parent.body.append(htmlElement);    
        } else
            parent.getHtmlElement().append(htmlElement);    
    

    }

    /**
     * @returns {HTMLDivElement}
     */
    getHtmlElement() {
        if (!this._htmlElement) {
            this._htmlElement = document.createElement('div');
            this._htmlElement.classList.add('draggable-interface');
        }
        return this._htmlElement;
    }

    render(timeMs) {
        super.render(timeMs);
        if(this._isActive) {
            this.getHtmlElement().classList.remove('inactive');
            this.getHtmlElement().classList.add('active');
        } else {
            this.getHtmlElement().classList.remove('active');
            this.getHtmlElement().classList.add('inactive');
        }
    }

    onMouseDown(evt) {
        super.onMouseDown(evt);
        if(!this.getHtmlElement().contains(evt.target))
            return;
        if(evt.target === this.dragBar || (this.dragBar.contains(evt.target) && evt.target != this.closeButton) ) {
            this.dragging = true;
            const timeStamp = new Date().valueOf();
            if(timeStamp - this.barLastClicked < 250) {
                const existingSize = this.getSize();
                const existingPosition = this.getScalarCoordinates();
                if(existingSize.width == 1 && existingSize.height == 1) {

                    if(this._oldSize) {
                        this.setSize(this._oldSize.width, this._oldSize.height);
                        this.setPositionRelativeToParent(this._oldPosition.x, this._oldPosition.y);
                    } else {
                        this.setSize(0.5, 0.5);
                        this.setPositionRelativeToParent(0, 0);
                    }

                } else {
                    this._oldSize = existingSize;
                    this._oldPosition = existingPosition;
                    this.setSize(1, 1);
                    this.setPositionRelativeToParent(0, 0);
                }
                
            }
            this.barLastClicked = timeStamp;
        }
        if (this._mouseX >= (this.getPixelWidth() - RESIZE_MARGIN - 1) && this._mouseY >= (this.getPixelHeight() - RESIZE_MARGIN - 1)) {
            this._resizeMode = 'SOUTHEAST';
        } else if (this._mouseY >= (this.getPixelHeight() - RESIZE_MARGIN - 1)) {
            this._resizeMode = 'SOUTH';
        } else if (this._mouseX >= (this.getPixelWidth() - RESIZE_MARGIN - 1)) {
            this._resizeMode = 'EAST';
        } else {
            this._resizeMode = 'NONE';
        }
    }

    /**
     * 
     * @param {PointerEvent} evt 
     */
    onMouseClick(evt) {
        if(!this.getHtmlElement().contains(evt.target))
            return;
        super.onMouseClick(evt);
    }




    getCursorStyle() {

        if (this._mouseX >= (this.getPixelWidth() - RESIZE_MARGIN - 1) && this._mouseY >= (this.getPixelHeight() - RESIZE_MARGIN - 1)) {
            return 'se-resize';
        } else if (this._mouseY >= (this.getPixelHeight() - RESIZE_MARGIN - 1)) {
            return 's-resize';
        } else if (this._mouseX >= (this.getPixelWidth() - RESIZE_MARGIN - 1)) {
            return 'e-resize'
        } else {
            return 'default';
        }
    }

    onMouseEnter(evt) {
        super.onMouseEnter(evt);
        if(!this.getHtmlElement().contains(evt.target))
            return;
        //this.getHtmlElement().style.backgroundColor = 'green';

    }

    onMouseLeave(evt) {
        if(!this.getHtmlElement().contains(evt.target))
            return;
        super.onMouseLeave(evt);
        //this.getHtmlElement().style.backgroundColor = 'black';
    }

    getDefaultPosition() {
        return {
            x: 0,
            y: 0
        }
    }
    
    onMouseUp(evt){
        super.onMouseUp(evt);
        this.dragging = false;
        this._resizeMode = 'NONE';
    }

    onMouseMove(evt) {
        super.onMouseMove(evt);

        if (!this._mouseDown)
            return;

        if (this.dragging && this._resizeMode == 'NONE') {
            this.translate(evt.movementX, evt.movementY);
        }

        const rect = this.getHtmlElement().getBoundingClientRect();
        const parentRect = this.getHtmlElement().parentElement.getBoundingClientRect();
        

        if (this._resizeMode == 'SOUTHEAST') {
            const scalarX = (rect.width + evt.movementX) / parentRect.width
            const scalarY = (rect.height + evt.movementY) / parentRect.height
            this.setSize(scalarX, scalarY);
        } else if (this._resizeMode === 'SOUTH') {
            const scalarX = this.scalarX;
            const scalarY = (rect.height + evt.movementY) / parentRect.height
            this.setSize(scalarX, scalarY);
        } else if (this._resizeMode === 'EAST') {
            const scalarX = (rect.width + evt.movementX) / parentRect.width
            const scalarY = this.scalarY;
            this.setSize(scalarX, scalarY);
        }

        /**
         *  else if (this._resizeMode == 'SOUTH') {
            this.setSize(width, height + evt.movementY);
        } else if (this._resizeMode == 'EAST') {
            this.setSize(width + evt.movementX, height);
        }
         */
    }


}

