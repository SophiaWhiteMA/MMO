package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.CommandLoadMap;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;

public abstract class Entity {

    private EntityManager entityManager = EntityManager.getInstance();
    private int x = 0;
    private int y = 0;

    public Entity(){

    }

    public void setMapInstance(MapInstance mapInstance) {

        if(this instanceof Player player) {
            player.sendNetworkCommand(new CommandLoadMap(mapInstance.getMap()));
        }

        entityManager.assignEntityToMapInstance(this, mapInstance);
    }

    public MapInstance getMapInstance(){
        return entityManager.getMapInstance(this);
    }

    public int getX(){
        return this.x;
    }

    public int getY(){
        return this.y;
    }

}
