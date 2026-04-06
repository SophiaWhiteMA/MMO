package dev.sophiawhite.level;

import org.jetbrains.annotations.Nullable;

import java.util.UUID;

/**
 * Incredibly generic class used to represent the location of basically anything.
 *
 */
public class Location implements Cloneable {

    private static final MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();

    private UUID mapInstanceUuid;
    private int x;
    private int y;

    public Location(int x, int y, @Nullable MapInstance mapInstance) {
        this(x, y, mapInstance == null ? null : mapInstance.getUuid());
    }

    public Location(int x, int y, @Nullable UUID mapInstanceUuid) {
        this.x = x;
        this.y = y;
        this.mapInstanceUuid = mapInstanceUuid;
    }

    public Location(){
        this.x = 0;
        this.y = 0;
        this.mapInstanceUuid = null;
    }

    /**
     * The MapInstance of both locations is not a factor in this calculation.
     * @param loc Location to which we are measuring the distance
     * @return sqrt((l1.x - l2.x) + (l1.y - l2.y))
     */
    public double getEuclidianDistance(Location loc){
        return Math.hypot(this.getX() - loc.getX(), this.getY() - loc.getY());
    }

    /**
     * The MapInstance of both locations is not a factor in this calculation.
     * @param loc Location to which we are measuring the distance.
     * @return Math.abs(l1.x - l2.x) + Math.abs(l1.y - l2.y)
     */
    public int getTaxicabDistance(Location loc) {
        return Math.abs(this.getX() - loc.getX()) + Math.abs(this.getY() - loc.getY());
    }

    public void setX(int x){
        this.x = x;
    }

    public void setY(int y){
        this.y = y;
    }

    public int getX(){
        return this.x;
    }

    public int getY(){
        return this.y;
    }

    public void setCoordinates(int x, int y){
        this.x = x;
        this.y = y;
    }

    @Nullable
    public UUID getMapInstanceUuid(){
        return this.mapInstanceUuid;
    }

    /**
     * Mutates the underlying MapInstance UUID of this location.
     * @param mapInstance MapInstance
     */
    public void setMapInstance(@Nullable MapInstance mapInstance) {
        if(mapInstance == null)
            this.mapInstanceUuid = null;
        else
            this.mapInstanceUuid = mapInstance.getUuid();
    }

    public void setMapInstanceUuid(UUID uuid){
        this.mapInstanceUuid = uuid;
    }

    /**
     *
     * @ The MapInstance associated with this Location assuming it hasn't been garbage collected.
     */
    public MapInstance getMapInstance(){
        return mapInstanceManager.getMapInstanceByUuid(this.mapInstanceUuid);
    }

    @Override
    public Location clone(){
        try {
            return (Location) super.clone();
        } catch(CloneNotSupportedException exc) {
            throw new AssertionError();
        }
    }

    @Override
    public String toString(){
        return String.format("(%s, %s) @ %s", this.x, this.y, this.mapInstanceUuid != null ? mapInstanceUuid : "null");
    }

}
