package dev.sophiawhite.entity;

import dev.sophiawhite.chat.ChatMessage;
import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.command.network.outbound.OutboundNetworkCommandQueue;
import dev.sophiawhite.command.network.outbound.chat.OutboundNetworkCommandChatAdd;
import dev.sophiawhite.command.network.outbound.map.OutboundNetworkCommandCommandMapLoad;
import dev.sophiawhite.level.Location;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;
import dev.sophiawhite.level.MapLink;
import jakarta.websocket.Session;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Player extends Entity {


    public static final int ENTITY_TAXICAB_VIEW_RANGE = 24;
    private static final MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();
    private static final int CHAT_HISTORY_MAX_SIZE = 1000;

    private final Session session;
    private String displayName;
    private final OutboundNetworkCommandQueue outboundNetworkCommandQueue = OutboundNetworkCommandQueue.getInstance();
    private List<ChatMessage> chatHistory = new ArrayList<>();


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

    @Override
    public void setLocation(Location loc) {


        if(loc == null || loc.getMapInstanceUuid() == null) {
            super.setLocation(loc);
            return;
        }

        Location existingLocation = this.getLocation();
        if(existingLocation == null || existingLocation.getMapInstanceUuid() == null || !existingLocation.getMapInstanceUuid().equals(loc.getMapInstanceUuid())) {
            this.sendNetworkCommand(new OutboundNetworkCommandCommandMapLoad(mapInstanceManager.getMapInstanceByUuid(loc.getMapInstanceUuid()).getMap()));
        }

        super.setLocation(loc);
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
     * @param usePreviousLocation
     * @return
     */
    public boolean canSee(Entity e, boolean usePreviousLocation) {
        if(e == this)
            return true;



        Location playerLocation = this.getLocation();
        Location entityLocation = usePreviousLocation ? e.getPreviousLocation() : e.getLocation();

        if(this.getLocation() == null || entityLocation == null || entityLocation.getMapInstanceUuid() == null) {
            return false;
        }

        return entityLocation.getTaxicabDistance(playerLocation) <= Player.ENTITY_TAXICAB_VIEW_RANGE;

    }
    public boolean canSee(Entity e) {
        return canSee(e, false);
    }

    @Override
    public void move(int x, int y, EntityMovementReason reason) {
        super.move(x, y, reason);
        if(this.getLocation() == null || this.getLocation().getMapInstance() == null)
            return;

        MapLink mapLink = this.getLocation().getMapInstance().getMapLinkAt(x, y);
        if(mapLink == null) {
            return;
        }
        mapLink.teleportEntity(this);
    }

    public void chat(ChatMessage chatMessage) {

        Instant fiveSecondsAgo = Instant.now().minusSeconds(5);
        List<ChatMessage> recentMessages = this.chatHistory.stream().filter(e -> {
            return e.getTimestamp().isAfter(fiveSecondsAgo);
        }).toList();

        if(recentMessages.size() >= 3)
            return;

        List<Player> nearbyPlayers = this.getPlayersInTaxicabRange(Player.ENTITY_TAXICAB_VIEW_RANGE);
        for(Player p: nearbyPlayers)
            p.sendNetworkCommand(new OutboundNetworkCommandChatAdd(chatMessage));

        if(this.chatHistory.size() > Player.CHAT_HISTORY_MAX_SIZE)
            this.chatHistory.removeFirst();

        this.chatHistory.add(chatMessage);


    }

}



