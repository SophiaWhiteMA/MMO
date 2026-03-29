package dev.sophiawhite.command.network.inbound;

import jakarta.websocket.Session;

import java.util.LinkedList;
import java.util.Queue;



public class InboundNetworkCommandQueue {

    private static final InboundNetworkCommandQueue instance = new InboundNetworkCommandQueue();

    private final Queue<InboundNetworkCommandQueueItem> inboundCommandQueue = new LinkedList<>();

    private InboundNetworkCommandQueue(){

    }

    /**
     * Provides a thread safe method for enqueueing networking commands
     * @param command
     * @param session
     */
    public synchronized void enqueueCommand(String command, Session session){
        synchronized(this.inboundCommandQueue) {
            this.inboundCommandQueue.add(new InboundNetworkCommandQueueItem(command, session));
        }
    }

    /**
     * Provides a thread safe method for de-queueing networking commands
     */
    public InboundNetworkCommandQueueItem dequeueCommand(){
        synchronized(this.inboundCommandQueue) {
            return this.inboundCommandQueue.poll();
        }
    }

    public static InboundNetworkCommandQueue getInstance(){
        return instance;
    }

}
