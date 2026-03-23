package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.ArrayList;

public class MapLayer {

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

    private MapLayer(){

    }

    private static MapLayer singleMapLayerFromJson(JsonNode layer) {

        MapLayer output = new MapLayer();

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
     * @param layers Array OR single JSON object expected.
     * @return List of all MapLayers in the array, or the single MapLayer provided if input was not array.
     */
    public static List<MapLayer> fromJson(JsonNode layers) {

        List<MapLayer> output = new ArrayList<MapLayer>();

        if (layers.isArray()) {
            for (JsonNode layer : layers) {
                output.add(singleMapLayerFromJson(layer));
            }
        } else {
            output.add(singleMapLayerFromJson(layers));
        }

        return output;
    }

}
