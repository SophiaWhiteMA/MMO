import assetCache, { AssetCache } from './assets/AssetCache.js';
import { init as networkInit, processQueuedInboundNetworkCommands } from './network/index.js';
import { rootInterface } from './gameInterface/index.js';

(async () => {

    await assetCache.initialize();
    networkInit();

    const tick = (timeMs) => {
        processQueuedInboundNetworkCommands();
        rootInterface.render(timeMs);
    }

    const renderLoop = (timeMs) => {
        tick(timeMs);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

})();