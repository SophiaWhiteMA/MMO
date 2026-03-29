package dev.sophiawhite.entity;

import dev.sophiawhite.tasks.Task;

public class TaskTickAllEntities extends Task {

    private EntityManager entityManager = EntityManager.getInstance();

    public TaskTickAllEntities(){

    }

    @Override
    public void run(){
        for(Entity e: entityManager.getAllEntities()) {
            e.tick();
        }
    }

}
