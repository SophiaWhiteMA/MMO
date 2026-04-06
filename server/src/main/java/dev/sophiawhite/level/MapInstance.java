package dev.sophiawhite.level;

import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityAdd;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityRemove;
import dev.sophiawhite.command.network.outbound.map.OutboundNetworkCommandCommandMapLoad;
import dev.sophiawhite.entity.EntityAddReason;
import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityRemoveReason;
import dev.sophiawhite.entity.Player;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

public class MapInstance {

    private Map map;
    private List<Entity> entities = new ArrayList<>();
    private UUID uuid;

    public MapInstance(Map map) {
        this.uuid = UUID.randomUUID();
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
     * Remove an entity from this map instance's internal list of entities and broadcast the necessary network side effects.
     * We assume that the entity has NOT yet had its location or map instance modified/nullified via Entity#setLocation
     * or Entity#setMapInstance prior to this method being invoked. This method is the first to be called when
     * moving an entity to a new instance or removing it outright.
     * @param e Entity being added
     * @param reason Why was the entity added? Player login, teleport, etc.
     */
    public void removeEntity(Entity e, EntityRemoveReason reason) {

        for(Player player: this.getPlayers()) {
            if(player.canSee(e) && e != player)
                player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(e, reason));
        }

        if(e instanceof Player player) {
            for(Entity e2: this.getEntities()) {
                if(player.canSee(e2))
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(e2, reason));

            }
        }

        this.entities.remove(e);
    }

    /**
     * Add an entity to this map instance's internal list of entities and broadcast the necessary network side effects.
     * We assume that the entity has the correct location and mapInstance set via Entity#setLocation and
     * Entity#setMapInstance prior to this method being invoked. This method is the first to be last when
     * moving an entity to a new instance or adding it for the first time.
     * @param e Entity being added
     * @param reason Why was the entity added? Player login, teleport, etc.
     */
    public void addEntity(Entity e, EntityAddReason reason){
        this.entities.add(e);

        List<Entity> destinationEntities = e.getEntitiesInTaxicabRange(Player.ENTITY_TAXICAB_VIEW_RANGE);
        List<Player> destinationPlayers = e.getPlayersInTaxicabRange(Player.ENTITY_TAXICAB_VIEW_RANGE);
        for(Player p: destinationPlayers.stream().filter(p -> p.canSee(e) && p != e).toList()) {
            p.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(e, EntityAddReason.PLAYER_LOGIN));
        }

        if(e instanceof Player player) {
            player.sendNetworkCommand(new OutboundNetworkCommandCommandMapLoad(this.getMap()));
            for(Entity e2: destinationEntities) {
                player.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(e2, EntityAddReason.WALK_IN_RANGE));
            }
        }

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

    public UUID getUuid(){
        return this.uuid;
    }

}
