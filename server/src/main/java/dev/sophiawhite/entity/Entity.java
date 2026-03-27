package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityMove;
import dev.sophiawhite.level.MapInstance;

import java.util.UUID;

public abstract class Entity {

    private EntityManager entityManager = EntityManager.getInstance();
    private int x = 0;
    private int y = 0;

    private UUID uuid;

    public abstract String getNetworkName();

    public Entity(){
        this.uuid = UUID.randomUUID();
    }

    public void setMapInstance(MapInstance mapInstance) {
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

    public UUID getUUID(){
        return this.uuid;
    }

    public void move(int x, int y) {
        this.x = x;
        this.y = y;
        OutboundNetworkCommandEntityMove cmd = new OutboundNetworkCommandEntityMove(this, x, y);
        for(Player p: this.getMapInstance().getPlayers()) {
            p.sendNetworkCommand(cmd);
        }
    }

}
