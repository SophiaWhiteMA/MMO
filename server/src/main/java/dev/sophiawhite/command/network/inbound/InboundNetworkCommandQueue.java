package dev.sophiawhite.command.network.inbound;

import jakarta.websocket.Session;

import java.util.LinkedList;
import java.util.Queue;



public class InboundNetworkCommandQueue {

    private static final InboundNetworkCommandQueue instance = new InboundNetworkCommandQueue();

    private final Queue<InboundNetworkCommandQueueItem> inboundCommandQueue = new LinkedList<>();

    private InboundNetworkCommandQueue(){

    }

    public void enqueueCommand(String command, Session session){
        this.inboundCommandQueue.add(new InboundNetworkCommandQueueItem(command, session));
    }

    public InboundNetworkCommandQueueItem dequeueCommand(){
        return this.inboundCommandQueue.poll();
    }

    public static InboundNetworkCommandQueue getInstance(){
        return instance;
    }

}
