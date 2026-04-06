package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

import dev.sophiawhite.entity.*;

public class MapLink {

    private double pixelX;
    private double pixelY;
    private PropertyList propertyList;
    private Map map;

    private MapLink(Map map, PropertyList propertyList, double pixelX, double pixelY) {
        this.map = map;
        this.propertyList = propertyList;
        this.pixelX = pixelX;
        this.pixelY = pixelY;
    }


    /**
     * Provided a JsonNode that is an arra
     * @param layers An JsonNode array object describing the map layers
     * @return
     */
    public static List<MapLink> fromJson(Map map, JsonNode layers) {
        List<MapLink> output = new ArrayList<>();

        for(JsonNode layer: layers) {
            String layerType = layer.path("type").asText();
            if(!layerType.equals("objectgroup"))
                continue;
            JsonNode objects = layer.path("objects");
            for(JsonNode object: objects) {
                String objectType = object.path("type").asText();
                if(!objectType.equals("MapLink"))
                    continue;
                double pixelX = object.path("x").asDouble();
                double pixelY = object.path("y").asDouble();
                PropertyList properties = PropertyList.fromJson(object.path("properties"));
                output.add(new MapLink(map, properties, pixelX, pixelY));
            }

        }

        return output;
    }

    public int getTileX(){
        return (int) Math.floor(this.pixelX / this.map.getTileWidth());
    }

    public int getTileY(){
        return (int) Math.floor(this.pixelY / this.map.getTileHeight());
    }

    public int getDestinationX(){
        return this.propertyList.getInt("destinationX");
    }

    public int getDestinationY(){
        return this.propertyList.getInt("destinationY");
    }

    /**
     *
     * @return True if this link leads to an instanced area
     */
    public boolean isInstanced(){
        return this.propertyList.getBoolean("instanced");
    }

    public MapInstance getMapInstance(){
        String target = this.propertyList.getString("target");
        MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();
        return mapInstanceManager.getMapInstanceByMapId(target);
    }

    public void teleportEntity(Entity e) {
        EntityManager entityManager = EntityManager.getInstance();
        MapInstance targetMapInstance = this.getMapInstance();
        int destinationX = this.getDestinationX();
        int destinationY = this.getDestinationY();

        e.teleport(new Location(destinationX, destinationY, targetMapInstance), EntityAddReason.MAP_LINK, EntityRemoveReason.MAP_LINK, EntityMovementReason.MAP_LINK);
    }

}
