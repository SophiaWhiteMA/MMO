package dev.sophiawhite.command.network.tasks;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommandQueue;
import dev.sophiawhite.command.network.outbound.OutboundNetworkCommandQueueItem;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import dev.sophiawhite.tasks.Task;
import jakarta.websocket.Session;

public class TaskProcessOutboundNetworkCommandQueue extends Task {

    private final OutboundNetworkCommandQueue queue = OutboundNetworkCommandQueue.getInstance();
    private final Logger logger = Logger.getInstance();
    private final EntityManager entityManager = EntityManager.getInstance();

    @Override
    public void run() {
        OutboundNetworkCommandQueueItem item = queue.dequeueCommand();
        while(item != null) {
            Session session = item.getSession();
            if(!session.isOpen()) {
                item = queue.dequeueCommand();
                continue;
            }
            session.getAsyncRemote().sendText(item.getCommand());
            item = queue.dequeueCommand();

            //TODO: Disconnect the player otherwise.
        }


    }
}
