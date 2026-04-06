package dev.sophiawhite.networking;

import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
import dev.sophiawhite.command.network.inbound.InboundNetworkCommandQueue;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.entity.EntityRemoveReason;
import dev.sophiawhite.entity.Player;
import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.OnError;

import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint("/listener")
public class MMOWebSocket {


    private final Logger logger = Logger.getInstance();
    private final InboundNetworkCommandQueue inboundNetworkCommandQueue = InboundNetworkCommandQueue.getInstance();

    private final EntityManager entityManager = EntityManager.getInstance();

    @OnOpen
    public void onOpen(Session session) {
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        inboundNetworkCommandQueue.enqueueCommand(message, session);
    }

    @OnClose
    public void onClose(Session session) {
        synchronized(entityManager) {
            Player player = entityManager.getPlayerBySession(session);
            if(player.getLocation() != null && player.getLocation().getMapInstance() != null) {
                player.getLocation().getMapInstance().removeEntity(player, EntityRemoveReason.PLAYER_LOGOUT);
            }
        }
    }

    @OnError
    public void onError(Throwable t) {
        System.err.println("Error: " + t.getMessage());
    }
}