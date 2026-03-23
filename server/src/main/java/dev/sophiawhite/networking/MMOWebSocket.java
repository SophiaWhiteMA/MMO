package dev.sophiawhite.networking;

import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
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


    private Logger logger = Logger.getInstance();

    @OnOpen
    public void onOpen(Session session) {

    }

    @OnMessage
    public void onMessage(String message, Session session) {

        logger.log(LogLevel.NETWORK, message);
        InboundNetworkCommand.parseCommand(session, message);

    }

    @OnClose
    public void onClose(Session session) {
        logger.log(LogLevel.NETWORK, "Closed?");
    }

    @OnError
    public void onError(Throwable t) {
        System.err.println("Error: " + t.getMessage());
    }
}