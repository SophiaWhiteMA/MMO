package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

public class TileSet {


    private static Map<String, TileSet> allTileSets = new HashMap<String, TileSet>();

    private String filePath;

    private int columns;
    private int imageHeight;
    private int imageWidth;
    private int tileWidth;
    private int tileHeight;
    private int margin;
    private int spacing;
    private int tileCount;
    private String tiledVersion;
    private String type;
    private String version;
    private String name;

    private PropertyList propertyList;
    private List<Tile> tiles;

    private TileSet() {
        this.tiles = new ArrayList<Tile>();
    }

    public static TileSet readFromPath(String path) throws IOException {

        TileSet existingTileset = allTileSets.get(path);
        if(existingTileset != null)
            return existingTileset;

        TileSet output = new TileSet();

        output.filePath = path;

        String json = Files.readString(Path.of(path));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode tileSet = mapper.readTree(json);

        output.name = tileSet.path("name").asText();
        output.columns = tileSet.path("columns").asInt();
        output.imageHeight = tileSet.path("imageHeight").asInt();
        output.imageWidth = tileSet.path("imageWidth").asInt();
        output.tileWidth = tileSet.path("tileWidth").asInt();
        output.tileHeight = tileSet.path("tileHeight").asInt();
        output.margin = tileSet.path("margin").asInt();
        output.spacing = tileSet.path("spacing").asInt();
        output.tileCount = tileSet.path("tileCount").asInt();

        output.tiledVersion = tileSet.path("tiledversion").asText();
        output.type = tileSet.path("type").asText();
        output.version = tileSet.path("version").asText();

        output.propertyList = PropertyList.fromJson(tileSet.path("properties"));
        output.tiles = Tile.fromJson(tileSet.path("tiles"));

        allTileSets.put(path, output);

        return output;
    }


    public int getColumns(){
        return this.columns;
    }

    public int getImageWidth(){
        return this.imageWidth;
    }

    public int getImageHeight(){
        return this.imageHeight;
    }

    public int getTileWidth(){
        return this.tileWidth;
    }

    public int getTileHeight(){
        return this.tileHeight;
    }

    public int getMargin(){
        return this.margin;
    }

    public int getSpacing(){
        return this.spacing;
    }

    public int getTileCount(){
        return this.tileCount;
    }

    public String getVersion(){
        return this.version;
    }

    public String getTiledVersion(){
        return this.tiledVersion;
    }

    public String getType(){
        return this.type;
    }

    public String getName(){
        return this.name;
    }

    public PropertyList getPropertyList (){
        return this.propertyList;
    }

    public List<Tile> getTiles(){
        return this.tiles;
    }

    public String getFilePath(){
        return this.filePath;
    }

}
