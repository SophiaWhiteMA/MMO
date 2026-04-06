package dev.sophiawhite.entity;

import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;
import jakarta.websocket.Session;


import java.util.List;
import java.util.ArrayList;
import java.util.UUID;


/**
 * All changes regarding Entity instances and their relationship to instances of MapInstance must be modified
 * using this class. This class ensures that network side effects for these operations are done in the correct order.
 *
 * A note on order of operations.
 * Internally, we always call Entity#setMapInstance first. This is because the only side effect of said method is
 * informing the client what Map to load. The side effects of MapInstance#removeEntity and MapInstance#addEntity
 * are dependent on this order of operations holding true.
 */
public class EntityManager {

    private static final EntityManager instance = new EntityManager();

    private final MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();

    private EntityManager(){

    }

    public static EntityManager getInstance(){
        return instance;
    }


    /**
     * Uses linear search to locate the player with the associated session
     * @param session A session object, likely received from a web socket
     * @return The associated player
     */
    public Player getPlayerBySession(Session session) {
        List<Player> players = this.getPlayers();
        for(Player player: players) {
            if(player.getSession() == session)
                return player;
        }
        return null;
    }

    /**
     *
     * @return A list of all entities across the entire server.
     */
    public List<Entity> getAllEntities(){
        List<Entity> output = new ArrayList<>();
        for(MapInstance m: mapInstanceManager.getInstances()) {
            output.addAll(m.getEntities());
        }
        return output;
    }

    /**
     *
     * @return A list of every player currently in memory
     */
    public List<Player> getPlayers(){
        List<Player> allPlayers = new ArrayList<Player>();
        for(MapInstance mapInstance: mapInstanceManager.getInstances()){
            allPlayers.addAll(mapInstance.getPlayers());
        }
        return allPlayers;
    }

    public Entity getEntityById(UUID uuid) {
        if(uuid == null) return null;
        for(Entity e: this.getAllEntities()) {
            if(e.getUuid().equals(uuid))
                return e;
        }
        return null;
    }

}
