import assetCache, { AssetCache } from './assets/AssetCache.js';
import { init as networkInit, processQueuedInboundNetworkCommands } from './network/index.js';
import mapRenderer from './render/MapRenderer.js';

(async () => {

    window.addEventListener('mousemove', mapRenderer.onMouseMove);
    window.addEventListener('mouseout', mapRenderer.onMouseLeave);
    window.addEventListener('click', mapRenderer.onMouseClick);
    window.addEventListener('wheel', mapRenderer.onWheel);
    window.addEventListener('contextmenu', mapRenderer.onContextMenu)

    await assetCache.initialize();
    networkInit();

    const tick = (timeMs) => {
        processQueuedInboundNetworkCommands();
        mapRenderer.render(timeMs);
    }

    const renderLoop = (timeMs) => {
        tick(timeMs);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

})();