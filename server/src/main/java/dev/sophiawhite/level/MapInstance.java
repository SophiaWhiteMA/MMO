package dev.sophiawhite.level;

import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.entity.Player;

import java.util.List;
import java.util.ArrayList;

public class MapInstance {

    private Map map;

    private EntityManager entityManager = EntityManager.getInstance();

    public MapInstance(Map map) {
        this.map = map;
    }


    public Map getMap(){
        return this.map;
    }

    public List<Entity> getEntities (){
        return entityManager.getEntities(this);
    }

    public List<Player> getPlayers(){
        List<Entity> entities = this.getEntities();
        List<Player> output = new ArrayList<>();
        for(Entity e: entities){
            if(e instanceof Player player)
                output.add(player);
        }
        return output;
    }

}
