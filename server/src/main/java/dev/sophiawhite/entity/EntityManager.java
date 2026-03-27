package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.entity.CommandEntitySetPlayer;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityAdd;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityRemove;
import dev.sophiawhite.command.network.outbound.map.CommandMapLoad;
import dev.sophiawhite.level.MapInstance;
import jakarta.websocket.Session;


import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;


/**
 * Manages the relationship between Entities and the MapInstances they occupy.
 * Network side effects are handled automatically.
 */
public class EntityManager {

    private static final EntityManager instance = new EntityManager();

    private Map<MapInstance, List<Entity>> mapInstancesToEntity;
    private Map<Entity, MapInstance> entitiesToMapInstances;

    private EntityManager(){
        mapInstancesToEntity = new HashMap<MapInstance, List<Entity>>();
        entitiesToMapInstances = new HashMap<Entity, MapInstance>();
    }

    public static EntityManager    getInstance(){
        return instance;
    }

    private void addEntry(Entity e, MapInstance mapInstance) {
        List<Entity> entitiesList = mapInstancesToEntity.computeIfAbsent(mapInstance, k -> new ArrayList<>());

        entitiesList.add(e);
        entitiesToMapInstances.put(e, mapInstance);

        if (e instanceof Player player) {
            player.sendNetworkCommand(new CommandMapLoad(mapInstance.getMap()));
        }

        for (Entity existing : entitiesList) {
            if (existing instanceof Player otherPlayer && existing != e) {
                otherPlayer.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(e));
            }

            if (e instanceof Player newPlayer) {
                newPlayer.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(existing));
            }
        }
    }

    public void assignEntityToMapInstance(Entity e, MapInstance mapInstance) {
        removeEntity(e);
        addEntry(e, mapInstance);
    }

    public void removeEntity(Entity e) {

        MapInstance mapInstance = entitiesToMapInstances.get(e);
        if(mapInstance == null)
            return;
        entitiesToMapInstances.remove(e);

        List<Entity> entityList = mapInstancesToEntity.get(mapInstance);
        if(entityList == null)
            return;

        entityList.remove(e);

        for(Entity e2: entityList) {
            if(e2 instanceof  Player player) {
                player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(e));
            }
        }
    }

    public MapInstance getMapInstance(Entity e) {
        return entitiesToMapInstances.get(e);
    }

    public List<Entity> getEntities(MapInstance mapInstance) {
        return mapInstancesToEntity.get(mapInstance);
    }

    public List<Player> getPlayers(){
        List<Player> allPlayers = new ArrayList<Player>();
        for(Entity e: this.entitiesToMapInstances.keySet()) {
            if(e instanceof Player player) {
                allPlayers.add(player);
            }
        }
        return allPlayers;
    }

    public Player getPlayerBySession(Session session) {
        List<Player> players = this.getPlayers();
        for(Player player: players) {
            if(player.getSession() == session)
                return player;
        }
        return null;
    }

}
