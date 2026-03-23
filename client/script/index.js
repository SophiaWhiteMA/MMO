import assetCache, {AssetCache} from './assets/AssetCache.js';
import mapRenderer, {MapRenderer} from './render/MapRenderer.js';




(async () => {

    await assetCache.initialize();

    const socket = new WebSocket("ws://127.0.0.1:8080/ws/listener");

    socket.onopen = (evt) => {
        socket.send(`login User<${crypto.randomUUID()}> password`)
    }

    socket.onmessage = (evt) => {

        //TODO: Better command parsing w/ Command classes.

        const command = evt.data;
        const splits = command.split(' ');
        
        console.log(command);

        const label = splits[0];
        if(label === 'loadmap') {
            const map = assetCache.getMapById(splits[1]);

            
            setTimeout(() => {
                mapRenderer.map = map;
                mapRenderer.cameraX = map.width / 2;
                mapRenderer.cameraY = map.height / 2;

                setTimeout(() => {
                    mapRenderer.cameraPanner.panCamera(mapRenderer.map.width - 1, mapRenderer.map.height - 1, 2500);
                }, 2000);

                setTimeout(() => {
                    mapRenderer.map = assetCache.getMapById('test_map_2');
                }, 2500);

            }, 1000);

            


        }
    }

    socket.onerror = err => console.log(err);

    socket.onclose = (evt) => console.log("Closed connection.");

})();