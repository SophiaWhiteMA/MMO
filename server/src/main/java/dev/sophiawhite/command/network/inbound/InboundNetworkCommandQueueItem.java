package dev.sophiawhite.command.network.inbound;

import jakarta.websocket.Session;

public class InboundNetworkCommandQueueItem {

    private final String command;
    private final Session session;

    public InboundNetworkCommandQueueItem(String command, Session session){
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