package dev.sophiawhite.entity;

import dev.sophiawhite.level.MapInstance;


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

    public static EntityManager getInstance(){
        return instance;
    }


    private void removeEntry(Entity e, MapInstance mapInstance) {
        //TODO: Broadcast to relevant players that entity has been added
        entitiesToMapInstances.remove(e);
        List<Entity> entitiesList = mapInstancesToEntity.get(mapInstance);
        if(entitiesList != null)
            entitiesList.remove(e);
    }

    private void addEntry(Entity e, MapInstance mapInstance){
        //TODO: Broadcast to relevant players that entity has been removed
        entitiesToMapInstances.put(e, mapInstance);
        List<Entity> entitiesList = mapInstancesToEntity.get(mapInstance);
        if(entitiesList == null) {
            List<Entity> newEntityList = new ArrayList<Entity>();
            newEntityList.add(e);
            mapInstancesToEntity.put(mapInstance, newEntityList);
        } else {
            entitiesList.add(e);
        }
    }

    public void assignEntityToMapInstance(Entity e, MapInstance mapInstance) {
        removeEntry(e, mapInstance);
        addEntry(e, mapInstance);
    }

    public void removeEntity(Entity e) {

        MapInstance mapInstance = entitiesToMapInstances.get(e);
        if(mapInstance == null)
            return;
        entitiesToMapInstances.remove(e);

        List<Entity> entityList = mapInstancesToEntity.get(mapInstance);
        if(entityList != null)
            entityList.remove(e);
    }

    public MapInstance getMapInstance(Entity e) {
        return entitiesToMapInstances.get(e);
    }

    public List<Entity> getEntities(MapInstance mapInstance) {
        return mapInstancesToEntity.get(mapInstance);
    }

}
