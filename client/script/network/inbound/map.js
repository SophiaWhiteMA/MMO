import assetCache from "../../assets/AssetCache.js";
import { mapRenderer } from "../../gameInterface/index.js";

/**
 * 
 * @param {Array<String>} args 
 */
const map = (args) => {
    const subCommand = args[0]

    switch(subCommand) {
        case 'load':
                const mapId = args[1];
                const _map = assetCache.getMapById(mapId);
                mapRenderer.setMap(_map);
                mapRenderer.camera.x = map.width / 2;
                mapRenderer.camera.y = map.height / 2;
            break;
    }


}

export default map;