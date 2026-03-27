package dev.sophiawhite.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import jakarta.websocket.Session;

public class Player extends Entity {

    private final Session session;
    private String displayName;

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

    public void sendNetworkCommand(OutboundNetworkCommand outboundCommand) {
        this.session.getAsyncRemote().sendText(outboundCommand.toString());
    }

    public void sendNetworkCommand(String command) {
        session.getAsyncRemote().sendText(command);
    }

    @Override
    public String getNetworkName() {
        return "player";
    }
}



