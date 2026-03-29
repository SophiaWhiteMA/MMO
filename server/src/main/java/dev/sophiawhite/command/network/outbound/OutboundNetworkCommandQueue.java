package dev.sophiawhite.command.network.outbound;

import jakarta.websocket.Session;

import java.util.LinkedList;
import java.util.Queue;



public class OutboundNetworkCommandQueue {

    private static final OutboundNetworkCommandQueue instance = new OutboundNetworkCommandQueue();

    private final Queue<OutboundNetworkCommandQueueItem> inboundCommandQueue = new LinkedList<>();

    private OutboundNetworkCommandQueue(){

    }

    public void enqueueCommand(String command, Session session){
        this.inboundCommandQueue.add(new OutboundNetworkCommandQueueItem(command, session));
    }

    public OutboundNetworkCommandQueueItem dequeueCommand(){
        return this.inboundCommandQueue.poll();
    }

    public static OutboundNetworkCommandQueue getInstance(){
        return instance;
    }

}
