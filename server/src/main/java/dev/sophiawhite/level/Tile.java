package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

public class Tile {

    private int id;
    private List<Property> properties;

    private Tile(){
        this.properties = new ArrayList<Property>();
    }

    private static Tile singleTileFromJson(JsonNode tile) {
        Tile output = new Tile();
        output.id = tile.path("id").asInt();
        output.properties = Property.fromJson(tile.path("properties"));
        return output;
    }

    /**
     *
     * @param tiles Array OR single JSON object expected.
     * @return List of all tiles in the array, or the single tile provided if input was not array.
     */
    public static List<Tile> fromJson(JsonNode tiles) {
        List<Tile> output = new ArrayList<Tile>();


        if (tiles.isArray()) {
            for (JsonNode tile : tiles) {
                output.add(singleTileFromJson(tile));
            }
        } else {
            output.add(singleTileFromJson(tiles));
        }

        return output;
    }

}
