package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

public class MapTileLayer {

    private String name;
    private int id;
    private int width;
    private int height;
    private double opacity;
    private String type;
    private boolean visible;


    public String getName(){
        return this.name;
    }

    public int getId(){
        return this.id;
    }

    public int getWidth(){
        return this.width;
    }

    public int getHeight(){
        return this.height;
    }

    public double getOpacity(){
        return this.opacity;
    }

    public String getType(){
        return this.type;
    }

    public boolean isVisible(){
        return this.visible;
    }

    private int[] data;




    private int x;
    private int y;

    private MapTileLayer(){

    }

    /**
     *
     * @param layer
     * @return null if the layer isn't a Tile Layer,
     */
    private static MapTileLayer singleMapLayerFromJson(JsonNode layer) {

        MapTileLayer output = new MapTileLayer();

        output.name = layer.path("name").asText();
        output.id = layer.path("id").asInt();
        output.width = layer.path("width").asInt();
        output.height = layer.path("height").asInt();
        output.opacity = layer.path("opacity").asDouble();
        output.type = layer.path("type").asText();
        output.visible = layer.path("visible").asBoolean();
        output.x = layer.path("x").asInt();
        output.y = layer.path("y").asInt();

        output.data = new int[output.width * output.height];

        for(int i = 0; i < output.width * output.height; i++) {
            output.data[i] = layer.path("data").get(i).asInt();
        }

        return output;
    }

    /**
     *
     * @param layers Array OR single JSON object expected. Originates as the 'layers' property of a tiled map.
     * @return List of all MapLayers in the array, or the single MapTileLayer provided if input was not array.
     */
    public static List<MapTileLayer> fromJson(JsonNode layers) {

        List<MapTileLayer> output = new ArrayList<MapTileLayer>();

        for (JsonNode layer : layers) {
            if(layer.path("type").asText().equals("tilelayer")) {
                output.add(singleMapLayerFromJson(layer));
            }
        }

        return output;
    }

    public int getTileIdAtPosition (int x, int y) {
        if(x >= this.width || x < 0 || y >= this.height || y < 0) {
            return -1;
        }

        return this.data[y * this.width + x];
    }


}
