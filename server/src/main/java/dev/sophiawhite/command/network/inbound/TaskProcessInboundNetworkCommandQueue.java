package dev.sophiawhite.command.network.inbound;

import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import dev.sophiawhite.tasks.Task;
import dev.sophiawhite.tasks.TaskManager;

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
