package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class Tile {

    private int id;
    private PropertyList propertyList;

    private Tile(){
        this.propertyList = new PropertyList();
    }

    public Tile(int id, PropertyList propertyList){
        this.id = id;
        this.propertyList = propertyList;
    }

    private static Tile singleTileFromJson(JsonNode tile) {
        Tile output = new Tile();
        output.id = tile.path("id").asInt();
        output.propertyList = PropertyList.fromJson(tile.path("properties"));
        return output;
    }


    public PropertyList getPropertyList(){
        return this.propertyList;
    }

    public boolean isSolid(){
        return this.propertyList.getBoolean("solid");
    }

    /**
     *
     * @param tiles Array OR single JSON object expected.
     * @return List of all tiles in the array, or the single tile provided if input was not array.
     */
    public static Map<Integer, Tile> fromJson(JsonNode tiles) {
        Map<Integer, Tile> output = new HashMap<Integer, Tile>();


        if (tiles.isArray()) {
            for (JsonNode jsonTile : tiles) {
                Tile tile = singleTileFromJson(jsonTile);
                output.put(tile.id, tile);
            }
        } else {
            Tile tile = singleTileFromJson(tiles);
            output.put(tile.id, tile);
        }

        return output;
    }

}
