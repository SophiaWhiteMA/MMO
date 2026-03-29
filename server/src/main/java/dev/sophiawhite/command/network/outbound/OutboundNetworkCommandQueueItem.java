package dev.sophiawhite.command.network.outbound;

import jakarta.websocket.Session;

public class OutboundNetworkCommandQueueItem {

    private final String command;
    private final Session session;

    public OutboundNetworkCommandQueueItem(String command, Session session){
        this.command = command;
        this.session = session;
    }

    public String getCommand(){
        return this.command;
    }

    public Session getSession(){
        return this.session;
    }

}