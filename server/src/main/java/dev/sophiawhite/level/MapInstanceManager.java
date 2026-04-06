package dev.sophiawhite.level;

import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

public class MapInstanceManager {

    private static MapInstanceManager instance = new MapInstanceManager();

    private List<MapInstance> instances;
    private Logger logger = Logger.getInstance();


    private MapInstanceManager(){
        this.instances = new ArrayList<MapInstance>();

    }

    private void loadMap(Path path) {
        try {
            Map map = Map.readFromPath(path);
            if(map.isInstanced())
                return;
            MapInstance newMapInstance = new MapInstance(map);
            this.instances.add(newMapInstance);
        } catch(IOException exc) {
            logger.log(LogLevel.SEVERE, "Server failed to initialize maps, forcing a shutdown\n" + exc.toString());
            System.exit(1);
        }
    }

    /**
     * Loads all non-instances
     */
    public void initialize(){

        logger.log(LogLevel.INFO, "Initializing maps");

        String mapsPath = "C:\\Users\\Sophia\\Developer\\Tiled\\mmo\\maps";

        try (Stream<Path> files = Files.list(Path.of(mapsPath))){
           files.forEach(this::loadMap);
        } catch(Exception exc) {
            logger.log(LogLevel.SEVERE, "Server failed to initialize maps, forcing a shutdown\n" + exc.toString());
            System.exit(1);
        }

        logger.log(LogLevel.INFO, "Maps initialized");


    }

    public List<MapInstance> getInstances(){
        return this.instances;
    }

    public static MapInstanceManager getInstance(){
        return instance;
    }

    /**
     * Convenience method for looking up maps by their globally unique, human-readable identifiers.
     *
     * This method IS NOT a reliable way of searching for instanced maps, ie
     * maps that can have multiple copies in memory at the same time since their "id" field will be identical.
     *
     *
     * @return
     */
    public MapInstance getMapInstanceByMapId(String id){
        for(MapInstance mapInstance: instances) {
            if(mapInstance.getMap().getId().equals(id)) {
                return mapInstance;
            }
         }
        return null;
    }

    public MapInstance getMapInstanceByUuid(UUID uuid){
        for(MapInstance mapInstance: this.instances) {
            if(mapInstance.getUuid().equals(uuid))
                return mapInstance;
        }
        return null;
    }

}
