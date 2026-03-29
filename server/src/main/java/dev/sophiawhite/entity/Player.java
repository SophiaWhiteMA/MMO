package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.command.network.outbound.OutboundNetworkCommandQueue;
import dev.sophiawhite.command.network.outbound.map.OutboundNetworkCommandCommandMapLoad;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapLink;
import jakarta.websocket.Session;

import java.util.List;

public class Player extends Entity {

    /**
     *
     */
    public static final int ENTITY_TAXICAB_VIEW_RANGE = 24;

    private final Session session;
    private String displayName;
    private final OutboundNetworkCommandQueue outboundNetworkCommandQueue = OutboundNetworkCommandQueue.getInstance();

    public Player(Session session) {
        this.session = session;
    }

    public Session getSession(){
        return this.session;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return this.displayName;
    }

    /**
     * Input network command is queued up to be sent at the end of this tick's cycle
     * @param outboundCommand
     */
    public void sendNetworkCommand(OutboundNetworkCommand outboundCommand) {
        sendNetworkCommand(outboundCommand.toString());
    }

    /**
     * Input network command is queued up to be sent at the end of this tick's cycle
     * @param command
     */
    public void sendNetworkCommand(String command) {
        outboundNetworkCommandQueue.enqueueCommand(command, this.session);
    }

    /**
     * Modify's the player's associated MapInstance
     * Network side effect: If non-null input, this player's client is instructed to load corresponding map
     * @param mapInstance
     */
    @Override
    public void setMapInstance(MapInstance mapInstance) {
        super.setMapInstance(mapInstance);
        if(mapInstance != null)
            this.sendNetworkCommand(new OutboundNetworkCommandCommandMapLoad(mapInstance.getMap()));
    }

    @Override
    public String getNetworkName() {
        return "player";
    }

    /**
     * Using the hardcoded value of ENTITY_TAXICAB_VIEW_RANGE, calculate if this Player can see the provided
     * Entity at either its current position, or its last position if specified. This method does not consider
     * if the entity is in the same MapInstance as the player. This is necessary for handling entity removal / logout.
     *
     *
     * @param e
     * @param previousPosition
     * @return
     */
    public boolean canSee(Entity e, boolean previousPosition) {
        if(e == this)
            return true;
        int x = previousPosition ? e.getPreviousX() : e.getX();
        int y = previousPosition ? e.getPreviousY() : e.getY();
        int taxicabDistance = this.getTaxicabDistance(x, y);
        return taxicabDistance <= Player.ENTITY_TAXICAB_VIEW_RANGE;
    }

    public boolean canSee(Entity e) {
        return canSee(e, false);
    }

    @Override
    public void move(int x, int y, EntityMovementReason reason) {
        super.move(x, y, reason);
        MapLink mapLink = this.getMapInstance().getMapLinkAt(x, y);
        if(mapLink == null) {
            return;
        }
        mapLink.teleportEntity(this);
    }


}



