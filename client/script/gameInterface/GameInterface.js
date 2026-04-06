import config from "../config/index.js";

export default class GameInterface {

    /** @type {HTMLElement} */
    _htmlElement;

    /** @type {Boolean} */
    _isStale = true;

    /** @type {Array<GameInterface>} */
    _children = [];

    /** @type {GameInterface | null} */
    _parent = null;

    _zIndex = 0;

    /** @type {Boolean} Whether or not the mouse is currently being held down. Forcibly set to false when the mouse leaves the browser window. */
    _mouseDown = false;

    /** @type {Number} The X coordinate where the mouse was when it started to be held down, relative to this Interface's underlying HTML element's origin */
    _mouseDownX = 0;

    /** @type {Number} The Y coordinate where the mouse was when it started to be held down, relative to this Interface's underlying HTML element's origin */
    _mouseDownY = 0;

    /** @type {Number} The x coordinate where the mouse is currently relative to this Interface's underlying HTML element's origin */
    _mouseX = 0;
    _mouseY = 0;

    _children = [];
    _activeChild = null;
    _closeable = false;
    _zIndex = 1;
    _isActive = false;
    _scalarPosition = { x: 0, y: 0 }
    _scalarSize = { width: 0.5, height: 0.5 };

    /**
     * 
     * @param {GameInterface | null} parent 
     */
    constructor(parent) {
        this._parent = parent;
        if (parent)
            parent.addChild(this);
        this._htmlElement = this.getHtmlElement();
        this.setPositionRelativeToParent(0, 0);
        this.registerEventListeners();

    }

    registerEventListeners() {
        const htmlElement = this.getHtmlElement();
        window.addEventListener('mousemove', (evt) => this.onMouseMove(evt));
        htmlElement.addEventListener('mouseout', (evt) => this.onMouseLeave(evt));
        htmlElement.addEventListener('mouseover', (evt) => this.onMouseEnter(evt))
        htmlElement.addEventListener('wheel', (evt) => this.onWheel(evt));
        htmlElement.addEventListener('contextmenu', (evt) => this.onContextMenu(evt));
        htmlElement.addEventListener('mouseup', (evt) => this.onMouseUp(evt));
        htmlElement.addEventListener('mousedown', (evt) => this.onMouseDown(evt));
        htmlElement.addEventListener('click', (evt) => this.onMouseClick(evt));
        htmlElement.addEventListener('resize', (evt) => this.onWindowResize(evt));
        const resizeObserver = new ResizeObserver((entries) => this._resizeObserverCallback(entries));
        resizeObserver.observe(htmlElement);
    }

    _resizeObserverCallback(entries) {
        for (const entry of entries) {
            if (entry.target === this.getHtmlElement()) {
                this.onWindowResize();
            }
        }
    }

    getPixelSize() {
        return {
            width: this.getHtmlElement().clientWidth,
            height: this.getHtmlElement().clientHeight
        }
    }

    getPixelWidth() {
        return this.getPixelSize().width
    }

    getPixelHeight() {
        return this.getPixelSize().height
    }

    getWidth() {
        return this.getSize().width;
    }

    getHeight() {
        return this.getSize().height;
    }

    getSize() {
        return this._scalarSize;
    }

    setSize(scalarWidth, scalarHeight) {
        const htmlElement = this.getHtmlElement();
        const parentElement = htmlElement.parentElement;
        const parentRect = parentElement.getBoundingClientRect();
        const oldWidth = parentRect.width;
        const oldHeight = parentRect.height;
        const newWidth = Math.floor(scalarWidth * parentRect.width);
        const newHeight = Math.floor(scalarHeight * parentRect.height);
        this._scalarSize = { width: scalarWidth, height: scalarHeight };
        htmlElement.style.width = newWidth + "px";
        htmlElement.style.height = newHeight + "px";
        this.onResize(oldWidth, oldHeight, newWidth, newHeight);
    }

    onResize(oldWidth, oldHeight, newWidth, newHeight) {
        for (const child of this._children) {
            const scalarCoordinates = child.getScalarCoordinates();
            const scalarSize = child.getSize();
            child.setPositionRelativeToParent(scalarCoordinates.x, scalarCoordinates.y);
            child.setSize(scalarSize.width, scalarSize.height);
        }
    }

    onWindowResize(evt) {

        const scalarSize = this.getSize();
        this.setSize(scalarSize.width, scalarSize.height);
        for (const child of this._children) {
            const scalarCoordinates = child.getScalarCoordinates();
            const scalarSize = child.getSize();
            child.setSize(scalarSize.width, scalarSize.height);
            child.setPositionRelativeToParent(scalarCoordinates.x, scalarCoordinates.y);
        }
        this.getChildren().forEach(e => e.onWindowResize(evt))
    }



    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseDown(evt) {
        if (!this.getHtmlElement().contains(evt.target))
            return;
        this._mouseDown = true;
        const rect = this.getHtmlElement().getBoundingClientRect();
        this._mouseDownX = evt.clientX - rect.left;
        this._mouseDownY = evt.clientY - rect.top;
        this._mouseX = evt.clientX - rect.left;
        this._mouseY = evt.clientY - rect.top;
        const parent = this.getParent();
        if (parent)
            parent.setActiveChild(this);
    }

    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseUp(evt) {
        this._mouseDown = false;
        const rect = this.getHtmlElement().getBoundingClientRect();
        this._mouseX = evt.clientX - rect.left;
        this._mouseY = evt.clientY - rect.top;
        this.getAllChildren().forEach(child => child.onMouseUp(evt))
    }

    /**
     * 
     * @param {PointerEvent} evt 
     */
    onMouseClick(evt) {
        if (!this.getHtmlElement().contains(evt.target))
            return;
        const parent = this.getParent();
        if (parent)
            parent.setActiveChild(this);
    }

    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseEnter(evt) {
        if (!this.getHtmlElement().contains(evt.target))
            return;
    }

    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseMove(evt) {
        if (!this.getHtmlElement().contains(evt.target))
            return;
        const { clientX, clientY } = evt;
        const rect = this.getHtmlElement().getBoundingClientRect();
        this._mouseX = clientX - rect.left;
        this._mouseY = clientY - rect.top;
    }


    /**
     * 
     * @param {MouseEvent} evt 
     */
    onMouseLeave(evt) {
        if (!this.getHtmlElement().contains(evt.target))
            return;
        this._mouseX = -100;
        this._mouseY = -100;
    }

    /**
     * 
     * @param {WheelEvent} evt 
     */
    onWheel(evt) {

    }

    /**
     * 
     * @param {PointerEvent} evt 
     */
    onContextMenu(evt) {

    }

    onKeyDown(evt) {
        const activeChild = this.getActiveChild();
        if (activeChild) {
            activeChild.onKeyDown(evt);
        } else if (evt.key === config.keyBindings.interface.close) {
            this.close();
        }

    }

    onKeyUp(evt) {
        this.getChildren().forEach(child => child.onKeyUp(evt));
    }

    /**
     * Renders the current state of the interface to its HTML element, but only if isStale() returns true. 
     * @param {Number} timeMs 
     */
    render(timeMs) {
        const htmlElement = this.getHtmlElement();
        htmlElement.style.cursor = this.getCursorStyle();
        htmlElement.style.zIndex = this._zIndex;
        for (const child of this._children.filter(e => e.isStale())) {
            child.render(timeMs);
        }
    }

    /**
     * @returns {GameInterface | null} Either the parewnt element or null if this is the root element.
     */
    getParent() {
        return this._parent;
    }

    /**
     * Marks the component as stale and in need of a re-render. 
     * @param {Boolean} stale 
     */
    setStale(stale) {
        this._isStale = stale;
    }

    isStale() {
        return this._isStale;
    }

    /**
     * @returns {HTMLElement}
     */
    getHtmlElement() {
        if (!this._htmlElement)
            this._htmlElement = document.getElementById('root');
        return this._htmlElement;
    }

    /**
     * 
     * @param {GameInterface} child 
     */
    addChild(child) {
        this._children.push(child);
    }

    /**
     * 
     * @returns {Number}
     */
    getZIndex() {
        return this._zIndex;
    }

    close(force) {
        if (this._closeable == true || force) {
            this.getHtmlElement().style.visibility = 'hidden';
            const parent = this.getParent();
            if (parent)
                parent.setActiveChild(null);
        }
    }

    open() {
        this.getHtmlElement().style.visibility = 'visible';
    }


    setPositionRelativeToParent(scalarX, scalarY) {
        const element = this.getHtmlElement();
        const parentElement = element.parentElement;
        
        const parentRect = parentElement.getBoundingClientRect();
        element.style.left = Math.floor(scalarX * parentRect.width) + "px";
        element.style.top = Math.floor(scalarY * parentRect.height) + "px";
        this._scalarPosition = { x: scalarX, y: scalarY };
    }

    getPositionRelativeToParent() {
        const element = this.getHtmlElement();
        if (!element)
            return null;
        const x = Number.parseInt(element.style.left?.replaceAll('px', '')) || 0;
        const y = Number.parseInt(element.style.top?.replaceAll('px', '')) || 0;
        return { x, y }
    }

    getScalarCoordinates() {
        return this._scalarPosition;
    }

    /**
     * Translates the interface a set number of pixels
     * @param {*} deltaX 
     * @param {*} deltaY 
     */
    translate(deltaX, deltaY) {
        const { x, y } = this.getPositionRelativeToParent();
        const rect = this.getHtmlElement().getBoundingClientRect();
        let newOriginX = x + deltaX;
        let newOriginY = y + deltaY;
        if (newOriginX < 0) newOriginX = 0;
        if (newOriginY < 0) newOriginY = 0;

        /** @type {HTMLElement} */
        const parentRect = this.getHtmlElement().parentElement.getBoundingClientRect();

        const overflowX = (newOriginX + rect.width) - parentRect.width
        if (overflowX > 0)
            newOriginX -= overflowX;
        const overflowY = (newOriginY + rect.height) - parentRect.height;
        if (overflowY > 0)
            newOriginY -= overflowY;


        this.setPositionRelativeToParent(newOriginX / parentRect.width, newOriginY / parentRect.height);
    }

    getCursorStyle() {
        return 'default';
    }

    getChildren() {
        return this._children;
    }

    getAllChildren() {
        const allChildren = [...this.getChildren()];
        let initialLength = allChildren.length;

        for (let i = 0; i < initialLength; i++) {
            allChildren.push(...allChildren[i].getAllChildren());
        }

        return allChildren;
    }

    getActiveChild() {
        return this._activeChild;
    }

    /**
     * 
     * @param {GameInterface | null} child 
     */
    setActiveChild(child) {
        this._activeChild = child;
        for (const c of this.getAllChildren()) {
            c._zIndex = this._zIndex + 1;
            c._isActive = false;
        }
        if (child !== null) {
            child._zIndex++;
            child._isActive = true;
        }

    }



}