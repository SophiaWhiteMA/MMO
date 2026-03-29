package dev.sophiawhite.command.network.tasks;

import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
import dev.sophiawhite.command.network.inbound.InboundNetworkCommandQueue;
import dev.sophiawhite.command.network.inbound.InboundNetworkCommandQueueItem;
import dev.sophiawhite.logging.Logger;
import dev.sophiawhite.tasks.Task;

public class TaskProcessInboundNetworkCommandQueue extends Task {

    private final InboundNetworkCommandQueue queue = InboundNetworkCommandQueue.getInstance();

    private final Logger logger = Logger.getInstance();

    @Override
    public void run() {

        InboundNetworkCommandQueueItem item = queue.dequeueCommand();
        while(item != null) {
            InboundNetworkCommand.parseCommand(item.getSession(), item.getCommand());
            item = queue.dequeueCommand();
        }

    }
}
