package dev.sophiawhite.main;

import dev.sophiawhite.command.network.tasks.TaskProcessInboundNetworkCommandQueue;
import dev.sophiawhite.command.network.tasks.TaskProcessOutboundNetworkCommandQueue;
import dev.sophiawhite.command.network.tasks.TaskPurgeClosedSockets;
import dev.sophiawhite.config.ServerConfig;
import dev.sophiawhite.entity.TaskTickAllEntities;
import dev.sophiawhite.level.MapInstanceManager;
import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import dev.sophiawhite.networking.MMOWebSocket;
import dev.sophiawhite.tasks.TaskManager;
import jakarta.websocket.DeploymentException;
import org.glassfish.tyrus.server.Server;

import java.util.logging.LogManager;

public class MMOServer implements Runnable {

    private static MMOServer instance;
    private static final int PORT = 8080;

    private final MapInstanceManager tiledMapInstanceManager = MapInstanceManager.getInstance();
    private final Logger logger = Logger.getInstance();
    private final TaskManager taskManager = TaskManager.getInstance();

    public static void main(String[] args) throws DeploymentException {
        LogManager.getLogManager().reset(); //makes the logger shut the fuck up
        instance = new MMOServer();
        new Thread(instance).start();
    }

    public static MMOServer getInstance(){
        return instance;
    }

    private MMOServer(){

    }

    @Override
    public void run(){

        Server server = new Server("localhost", PORT, "/ws", null, MMOWebSocket.class);

        try {
            server.start();
            logger.log(LogLevel.INFO, "Server started successfully and listening on port " + PORT);
        } catch(DeploymentException exc) {
            logger.log(LogLevel.SEVERE, "Server failed to start.\n" + exc.toString());
        }

        tiledMapInstanceManager.initialize();

        taskManager.scheduleRepeatingTask(new TaskPurgeClosedSockets(), 1);
        taskManager.scheduleRepeatingTask(new TaskProcessInboundNetworkCommandQueue(), 1);
        taskManager.scheduleRepeatingTask(new TaskTickAllEntities(), 1);
        taskManager.scheduleRepeatingTask(new TaskProcessOutboundNetworkCommandQueue(), 1);

        double drawInterval = 1000000000 / ServerConfig.getInstance().getTicksPerSecond();

        double delta = 0;
        long lastTime = System.nanoTime();
        long currentTime;

        while (true) {
            currentTime = System.nanoTime();
            delta += (currentTime - lastTime) / drawInterval;
            lastTime = currentTime;

            if (delta >= 1) {
                taskManager.onTick();
                delta--;
            }

        }


    }


}
