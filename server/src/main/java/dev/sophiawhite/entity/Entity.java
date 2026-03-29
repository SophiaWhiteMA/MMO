package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityAdd;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityMove;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityRemove;
import dev.sophiawhite.level.MapInstance;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public abstract class Entity {

    private MapInstance mapInstance;
    private int x = 0;
    private int y = 0;
    private int previousX = 0;
    private int previousY = 0;

    private final UUID uuid;

    private static final int PATH_ITERATION_LIMIT = 2000;
    private List<int[]> currentPath = new ArrayList<>();

    private EntityPathfinder entityPathfinder = new EntityPathfinder();

    /**
     * The client differentiates entity types using this field. Conventionally, the name defined by subclasses
     * is the camelCase name of the subclass.
     * @return
     */
    public abstract String getNetworkName();

    public Entity(){
        this.uuid = UUID.randomUUID();
    }

    /**
     * WARNING: This class is not intended to be invoked outside the EntityManager class.
     * Set this entity's associated MapInstance.
     * @param mapInstance
     */
    public void setMapInstance(MapInstance mapInstance) {
        this.mapInstance = mapInstance;
    }

    /**
     *
     * @return The MapInstance this entity is a member of.
     */
    public MapInstance getMapInstance(){
        return this.mapInstance;
    }

    public UUID getUUID(){
        return this.uuid;
    }

    /**
     * Entity's position is mutated and this change is broadcast to relevant players.
     * Internally, the entity's previous position is also updated.
     * @param x
     * @param y
     */
    public void move(int x, int y, EntityMovementReason reason) {
        this.setPreviousPosition(this.x, this.y);
        this.x = x;
        this.y = y;

        for(Player p: this.getMapInstance().getPlayers()) {

            boolean canPlayerSeeNow = p.canSee(this);
            boolean couldPlayerSeePreviously = p.canSee(this, true);

            if(couldPlayerSeePreviously && canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityMove(this, this.x, this.y));
            }

            if(couldPlayerSeePreviously && !canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(this));
                if(this instanceof Player player)
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(p));
            }

            if (!couldPlayerSeePreviously && canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(this));
                if(this instanceof Player player)
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(p));
            }



        }
    }

    /**
     * Sets the entity's position WITHOUT network side effects. This method should be rarely used and only in
     * controlled settings.
     * @param x
     * @param y
     */
    public void setPosition(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @return The entity's current X coordinate
     */
    public int getX(){
        return this.x;
    }

    public int getPreviousX(){
        return this.previousX;
    }

    public int getPreviousY(){
        return this.previousY;
    }

    /**
     *
     * @return THe entity's current Y coordinate
     */
    public int getY(){
        return this.y;
    }

    /**
     * WARNING: The entity's previous position is managed nearly exclusively by this class
     * @param x
     * @param y
     */
    public void setPreviousPosition(int x, int y) {
        this.previousX = x;
        this.previousY = y;
    }

    public int getTaxicabDistance(int x, int y) {
        return Math.abs(x - this.x) + Math.abs(this.y - y);
    }

    public int getTaxicabDistance(Entity e) {
        return this.getTaxicabDistance(e.getX(), e.getY());
    }

    public List<Entity> getNearbyEntities(int maxTaxicabDistance){
        return this.mapInstance.getEntities().stream().filter(e -> {
            return this.getTaxicabDistance(e) <= maxTaxicabDistance;
        }).toList();
    }

    public List<Player> getNearbyPlayers(int maxTaxicabDistance) {
        return this.getNearbyEntities(maxTaxicabDistance).stream().filter(e -> {
            return e instanceof Player;
        }).map(e -> (Player) e).toList();
    }

    public EntityPathfinder getEntityPathfinder() {
        return entityPathfinder;
    }

    public void beginPathfinding(int destinationX, int destinationY){
        this.entityPathfinder.beginPathfinding(this.mapInstance, this.x, this.y, destinationX, destinationY);
    }

    public void tick(){
        List<int[]> currentPath = this.entityPathfinder.getCurrentPath();
        if(currentPath == null || currentPath.isEmpty())
            return;
        int[] coordinates = currentPath.removeFirst();

        if(this.isRunning() && !currentPath.isEmpty() && currentPath.getFirst() != null) {
            coordinates = currentPath.removeFirst();
        }

        int destinationX = coordinates[0];
        int destinationY = coordinates[1];
        this.move(destinationX, destinationY, EntityMovementReason.NETWORK_MOVE_COMMAND);

    }

    private boolean isRunning(){
        return true;
    }


}
