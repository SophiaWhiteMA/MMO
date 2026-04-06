package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityAdd;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityMove;
import dev.sophiawhite.command.network.outbound.entity.OutboundNetworkCommandEntityRemove;
import dev.sophiawhite.level.Location;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public abstract class Entity {

    private Location location;
    private Location previousLocation;
    private final UUID uuid;

    private static final int PATH_ITERATION_LIMIT = 2000;
    private static final Logger logger = Logger.getInstance();


    private final Pathfinder pathfinder = new Pathfinder();

    /**
     * The client differentiates entity types using this field. Conventionally, the name defined by subclasses
     * is the camelCase name of the subclass.
     * @return
     */
    public abstract String getNetworkName();

    public Entity(){
        this.uuid = UUID.randomUUID();
        this.location = new Location();
    }

    public UUID getUuid(){
        return this.uuid;
    }

    /**
     * Entity's position is mutated and this change is broadcast to relevant players.
     * Internally, the entity's previous position is also updated.
     * @param x
     * @param y
     */
    public void move(int x, int y, EntityMovementReason reason) {

        if(this.location == null || this.location.getMapInstance() == null)
            return;

        this.previousLocation = this.location.clone();
        this.location.setCoordinates(x, y);

        for(Player p: this.location.getMapInstance().getPlayers()) {

            boolean canPlayerSeeNow = p.canSee(this);
            boolean couldPlayerSeePreviously = p.canSee(this, true);

            if(couldPlayerSeePreviously && canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityMove(this, this.location.getX(), this.location.getY()));
            }

            if(couldPlayerSeePreviously && !canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(this, EntityRemoveReason.OUT_OF_RANGE));
                if(this instanceof Player player)
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityRemove(p, EntityRemoveReason.OUT_OF_RANGE));
            }

            if (!couldPlayerSeePreviously && canPlayerSeeNow) {
                p.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(this, EntityAddReason.WALK_IN_RANGE));
                if(this instanceof Player player)
                    player.sendNetworkCommand(new OutboundNetworkCommandEntityAdd(p, EntityAddReason.WALK_IN_RANGE));
            }

        }
    }

    /**
     * Entity's position is mutated and this change is broadcast to relevant players.
     * Internally, the entity's previous position is also updated.
     * @param loc Location
     * @param reason EntityMovementReason
     */
    public void move(Location loc, EntityMovementReason reason){
        this.move(loc.getX(), loc.getY(), reason);
    }

    /**
     * Sets the entity's position WITHOUT network side effects. This method should be rarely used and only in
     * controlled settings.
     * @param loc Location
     */
    public void setLocation(@Nullable Location loc) {
        this.location = loc;
    }


    @Nullable
    public Location getLocation(){
        return this.location;
    }

    /**
     * WARNING: The entity's previous position is managed nearly exclusively by this class
     * @param loc Location
     */
    public void setPreviousLocation(Location loc) {
        this.previousLocation = loc;
    }

    public Location getPreviousLocation(){
        return this.previousLocation;
    }

    public List<Entity> getEntitiesInTaxicabRange(int maxTaxicabDistance){
        if(this.location != null && this.location.getMapInstance() != null) {
            return this.location.getMapInstance().getEntities().stream()
                    .filter(e -> e.getLocation() != null)
                    .filter(e -> e.getLocation().getTaxicabDistance(this.location) <= Player.ENTITY_TAXICAB_VIEW_RANGE).toList();
        }
        return new ArrayList<Entity>();
    }

    public List<Player> getPlayersInTaxicabRange(int maxTaxicabDistance) {
        return this.getEntitiesInTaxicabRange(maxTaxicabDistance).stream().filter(e -> {
            return e instanceof Player;
        }).map(e -> (Player) e).toList();
    }

    public Pathfinder getPathfinder() {
        return pathfinder;
    }

    public void beginPathfinding(int destinationX, int destinationY){
        MapInstance mapInstance = this.getLocation() == null ? null : this.getLocation().getMapInstance();
        this.pathfinder.beginPathfinding(mapInstance, this.location.getX(), this.location.getY(), destinationX, destinationY);
    }

    public void tick(){
        List<int[]> currentPath = this.pathfinder.getCurrentPath();
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

    public void teleport(Location destination, EntityAddReason addReason, EntityRemoveReason removeReason, EntityMovementReason moveReason) {

        if(destination == null) {
            logger.log(LogLevel.ERROR, String.format("Null teleport destination provided for entity %s", this.getUuid()));
            return;
        }

        MapInstance destinationInstance = destination.getMapInstance();
        if(destinationInstance == null) {
            logger.log(LogLevel.ERROR, String.format("Invalid teleport destination for entity %s. Target destination is in null instance at (%s, %s)", this.getUuid(), destination.getX(), destination.getY()));
            return;
        }

        Location startLocation = this.getLocation();
        MapInstance startInstance = startLocation == null ? null : startLocation.getMapInstance();

        if(startInstance == destinationInstance) {
            this.move(destination.getX(), destination.getY(), moveReason);
            this.getPathfinder().clearPath();
            return;
        }

        if(startInstance != null) {
            startInstance.removeEntity(this, EntityRemoveReason.TELEPORT);
        }

        this.setPreviousLocation(startLocation == null ? null : startLocation.clone());
        this.setLocation(destination.clone());

        destinationInstance.addEntity(this, EntityAddReason.TELEPORT);


        this.pathfinder.clearPath();

    }

    public void teleport(Location location) {
        teleport(location, EntityAddReason.TELEPORT, EntityRemoveReason.TELEPORT, EntityMovementReason.TELEPORT);
    }

    public void warp(Location location) {
        teleport(location, EntityAddReason.MAP_LINK, EntityRemoveReason.MAP_LINK, EntityMovementReason.MAP_LINK);
    }

}
