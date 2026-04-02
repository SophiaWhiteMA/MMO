package dev.sophiawhite.entity;

import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;
import jakarta.websocket.Session;


import java.util.List;
import java.util.ArrayList;


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
     *
     * Changes the MapInstance the provided entity is associated with and handles all necessary network side effects
     *
     * @param e Entity being created or reassigned to a new map instance
     * @param mapInstance THe map instance the entity is being assigned to
     */
    public void assignEntityToMapInstance(Entity e, MapInstance mapInstance, EntityAddReason addReason, EntityRemoveReason removeReason) {
        this.removeEntity(e, removeReason);
        e.setMapInstance(mapInstance);
        mapInstance.addEntity(e, addReason);
    }


    /**
     * Changes an entity's map instance and coordinates simultaneously. If the entity is already in the
     * same MapInstance, then that is handled as a movement with reason TELEPORT
     *
     * @param e Entity
     * @param mapInstance MapInstance
     * @param x int
     * @param y int
     * @param addReason EntityAddReason
     * @param removeReason EntityRemoveReason
     * @param moveReason EntityMoveReason
     */
    public void teleport(Entity e, MapInstance mapInstance, int x, int y, EntityAddReason addReason, EntityRemoveReason removeReason, EntityMovementReason moveReason) {

        if(e == null )
            throw new RuntimeException("Null Entity provided to EntityManager#teleport");

        if(mapInstance == null)
            throw new RuntimeException("Null MapInstance provided to EntityManager#teleport");

        if(mapInstance != e.getMapInstance()) {
            this.removeEntity(e, removeReason);
            e.setPosition(x, y);
            e.setPreviousPosition(x, y);
            e.setMapInstance(mapInstance);
            mapInstance.addEntity(e, addReason);
        } else {
           e.move(x, y, moveReason);
        }
        e.getEntityPathfinder().clearPath();
    }

    /**
     * Changes an entity's map instance and coordinates simultaneously. If the entity is already in mapInstance,
     * then that is handled as a movement with reason TELEPORT.
     * @param e Entity being teleported
     * @param mapInstance Destination map instance
     * @param x New x coordinate
     * @param y New y coordinate
     */
    public void teleport(Entity e, MapInstance mapInstance, int x, int y) {
        teleport(e, mapInstance, x, y, EntityAddReason.TELEPORT, EntityRemoveReason.TELEPORT, EntityMovementReason.TELEPORT);
    }

    /**
     * Alias for the teleport method, but with a reason of MAP_LINK
     * @param e Entity being teleported
     * @param mapInstance Destination map instance
     * @param x New x coordinate
     * @param y New y coordinate
     */
    public void warp(Entity e, MapInstance mapInstance, int x, int y) {
        teleport(e, mapInstance, x, y, EntityAddReason.MAP_LINK, EntityRemoveReason.MAP_LINK, EntityMovementReason.MAP_LINK);
    }

    /**
     *
     * Completely de-registers an entity and broadcasts to clients that it has been removed.
     *
     * After this method resolves, the entity is effectively dematerialized / does not exist and can be modified
     * freely without network effects. After being modified, the entity can be re-materialized by calling addEntity,
     * and it's new internal state will be broadcast as normal.
     *
     * An example of where this is used is the teleport function. The entity's current and previous position
     * are both changed during the dematerialization stage.
     *
     * @param e Entity to be removed
     * @param reason EntityRemoveReason The underlying reason why the entity was removed from the EntityManager
     */
    public void removeEntity(Entity e, EntityRemoveReason reason) {
        if(e == null)
            return;

        MapInstance mapInstance = e.getMapInstance();
        e.setMapInstance(null);

        if(mapInstance != null)
            mapInstance.removeEntity(e, reason);
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


}
