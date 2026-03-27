import assetCache, { AssetCache } from './assets/AssetCache.js';
import { init as networkInit, processQueuedInboundNetworkCommands } from './network/index.js';
import mapRenderer from './render/MapRenderer.js';

(async () => {

    window.addEventListener('mousemove', (evt) => {
        mapRenderer.onMouseMove(evt);
    });

    window.addEventListener('mouseout', evt => {
        mapRenderer.onMouseLeave(evt);
    })

    window.addEventListener('click', evt => {
        mapRenderer.onMouseClick(evt);
    })

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