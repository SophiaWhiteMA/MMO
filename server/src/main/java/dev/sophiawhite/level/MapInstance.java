package dev.sophiawhite.level;

import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityAdd;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityRemove;
import dev.sophiawhite.entity.EntityAddReason;
import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityRemoveReason;
import dev.sophiawhite.entity.Player;

import java.util.List;
import java.util.ArrayList;

public class MapInstance {

    private Map map;
    private List<Entity> entities = new ArrayList<>();

    public MapInstance(Map map) {
        this.map = map;
    }



    /**
     *
     * @return The underlying Map that this instance is based on
     */
    public Map getMap(){
        return this.map;

    }


    /**
     * Adds the input entity to this MapInstance's entity list and broadcasts this change to relevant players
     *
     * @param e Entity
     * @param reason EntityAddReason
     */
    public void addEntity(Entity e, EntityAddReason reason) {
        this.entities.add(e);

        for(Player player: this.getPlayers()) {
            if(player.canSee(e))
                player.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(e));
        }

        if(e instanceof Player player) {
            for(Player otherPlayer: this.getPlayers()) {
                if(player != otherPlayer && player.canSee(otherPlayer)) {
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(otherPlayer));
                }
            }
        }
    }

    /**
     * Removes the specified entity from this instance and broadcasts this change to all players in the instance.
     * If the entity being removed is a player, then that player is told to remove all entities on the client-side
     * including itself.
     * @param e Entity being removed
     * @param reason Why the entity was removed
     */
    public void removeEntity(Entity e, EntityRemoveReason reason) {

        for(Player player: this.getPlayers()) {
            if(player.canSee(e) && e != player)
                player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(e));
        }

        if(e instanceof Player player) {
            for(Entity e2: this.getEntities()) {
                if(player.canSee(e2))
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(e2));

            }
        }

        this.entities.remove(e);
    }

    public List<MapLink> getMapLinks(){
        return this.map.getMapLinks();
    }

    public List<Entity> getEntities (){
        return this.entities;
    }

    public List<Player> getPlayers(){
        List<Entity> entities = this.entities;
        List<Player> output = new ArrayList<>();
        for(Entity e: entities){
            if(e instanceof Player player)
                output.add(player);
        }
        return output;
    }


    public Tile getTile(int x, int y, int z) {
        return this.map.getTile(x, y, z);
    }


    public boolean isObstructedAt(int x, int y){
        List<MapTileLayer> mapTileLayers = this.map.getLayers();
        for(int z = 0; z < mapTileLayers.size(); z++) {
            Tile tile = this.map.getTile(x, y, z);
            if(tile != null && tile.isSolid()){
                return true;
            }
        }
        return false;
    }

    public boolean isInBounds(int x, int y) {
        return x >= 0 && y >= 0 && x < this.map.getWidth() && y < this.map.getHeight();
    }

    public MapLink getMapLinkAt(int tileX, int tileY) {
        return this.map.getMapLinkAt(tileX, tileY);
    }

}
