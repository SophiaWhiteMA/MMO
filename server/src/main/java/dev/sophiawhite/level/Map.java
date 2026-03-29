package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.ArrayList;
import java.util.TreeMap;

public class Map {

    private String filePath;

    private int height;
    private int width;
    private int tileWidth;
    private int tileHeight;
    private boolean infinite;
    private int compressionLevel;
    private String orientation;
    private int nextLayerId;
    private int nextObjectId;

    private String renderOrder;
    private String tiledVersion;
    private String type;
    private String version;

    private PropertyList propertyList;
    private List<MapTileLayer> layers;
    private java.util.Map<Integer, TileSet> tileSets; //Firstgid -> Tileset
    private List<MapLink> mapLinks;




    private Map() {
        this.layers = new ArrayList<MapTileLayer>();
        this.tileSets = new TreeMap<>();
        this.mapLinks = new ArrayList<>();
    }

    public static Map readFromPath(Path path) throws IOException {
        return readFromPath(path.toString());
    }

    public static Map readFromPath(String path) throws IOException {

        Map output = new Map();
        output.filePath = path;

        String json = Files.readString(Path.of(path));
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);

        output.width = root.path("width").asInt();
        output.height = root.path("height").asInt();

        output.tileWidth = root.path("tilewidth").asInt();
        output.tileHeight = root.path("tileheight").asInt();

        output.infinite = root.path("infinite").asBoolean();
        output.compressionLevel = root.path("compressionlevel").asInt();
        output.orientation = root.path("orientation").asText();

        output.nextLayerId = root.path("nextlayerid").asInt();
        output.nextObjectId = root.path("nextobjectid").asInt();

        output.tiledVersion = root.path("tiledversion").asText();
        output.renderOrder = root.path("renderorder").asText();
        output.type = root.path("type").asText();
        output.version = root.path("version").asText();

        output.propertyList = PropertyList.fromJson(root.path("properties"));

        output.layers = MapTileLayer.fromJson(root.path("layers"));
        output.mapLinks = MapLink.fromJson(output, root.path("layers"));

        for(JsonNode tileSetDescriptor: root.path("tilesets")) {
            int firstGid = tileSetDescriptor.path("firstgid").asInt();
            String relativeTilesetPath = tileSetDescriptor.path("source").asText();
            String parentDir = Path.of(output.filePath).getParent().toString();
            TileSet newTileSet = TileSet.readFromPath(Path.of(parentDir, relativeTilesetPath).toString());
            output.tileSets.put(firstGid, newTileSet);
        }


        return output;


    }

    public List<MapTileLayer> getLayers(){
        return this.layers;
    }

    public java.util.Map<Integer, TileSet> getTileSets(){
        return this.tileSets;
    }

    public int getWidth(){
        return this.width;
    }

    public int getHeight(){
        return this.height;
    }

    public int getTileWidth(){
        return this.tileWidth;
    }

    public int getTileHeight(){
        return this.tileHeight;
    }

    public boolean isInfinite(){
        return this.infinite;
    }

    public int getCompressionLevel(){
        return this.compressionLevel;
    }

    public int getNextLayerId(){
        return this.nextLayerId;
    }

    public int getNextObjectId(){
        return this.nextObjectId;
    }

    public String getOrientation(){
        return this.orientation;
    }

    public String getRenderOrder(){
        return this.renderOrder;
    }

    public String getTiledVersion(){
        return this.tiledVersion;
    }

    public String getType(){
        return this.type;
    }

    public String getVersion(){
        return this.version;
    }

    public String getFilePath(){
        return this.filePath;
    }

    public PropertyList getPropertyList(){
        return this.propertyList;
    }

    public String getId(){
        return this.propertyList.getString("id");
    }

    public boolean isInstanced(){
        return this.propertyList.getBoolean("instanced");
    }

    public String getName(){
        return this.propertyList.getString("name");

    }

    public int getFirstGidFromGlobalTileId(int globalTileId){
        for(int firstGid: this.tileSets.keySet()) {
            if(globalTileId >= firstGid)
                return firstGid;
        }
        return -1;
    }

    public TileSet getTileSetFromTileId (int globalId) {
        for(int firstGid: this.tileSets.keySet()) {
            if(globalId >= firstGid)
                return this.tileSets.get(firstGid);
        }
        return null;
    }

    public Tile getTile(int x, int y, int z) {
        MapTileLayer mapTileLayer = this.layers.get(z);
        int globalTileId = mapTileLayer.getTileIdAtPosition(x, y);
        if(globalTileId == -1)
            return null;

        TileSet tileSet = this.getTileSetFromTileId(globalTileId);
        if(tileSet == null)
            return null;
        int firstGid = getFirstGidFromGlobalTileId(globalTileId);
        int localTileId = globalTileId - firstGid;

        return tileSet.getTileByLocalId(localTileId);

    }

    public List<MapLink> getMapLinks(){
        return this.mapLinks;
    }

    /**
     *
     * @param tileX
     * @param tileY
     * @return Null if none found
     */
    public MapLink getMapLinkAt(int tileX, int tileY) {
        for(MapLink mapLink: this.mapLinks) {
            if(mapLink.getTileX() == tileX && mapLink.getTileY() == tileY) {
                return mapLink;
            }
        }
        return null;
    }

}
