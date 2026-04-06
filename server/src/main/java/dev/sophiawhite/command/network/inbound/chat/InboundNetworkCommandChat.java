package dev.sophiawhite.command.network.inbound.chat;

import dev.sophiawhite.chat.ChatMessage;
import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
import dev.sophiawhite.command.network.outbound.chat.OutboundNetworkCommandChatAdd;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.entity.Player;
import jakarta.websocket.Session;

import java.util.List;

public class InboundNetworkCommandChat extends InboundNetworkCommand {

    private static final String label = "chat";
    private static final String description = "";
    private static final String help = "";

    private EntityManager entityManager = EntityManager.getInstance();

    public InboundNetworkCommandChat() {
        super(label, description, help);
    }

    @Override
    public void onCommand(Session session, String[] args) throws Exception {
        String subCommand = args[0];
        String[] subArgs = new String[args.length - 1];
        System.arraycopy(args, 1, subArgs, 0, args.length - 1);
        if (subCommand.equals("send")) {
            chatSend(session, subArgs);
        }
    }

    private void chatSend(Session session, String[] subArgs) {
        String message = String.join(" ", subArgs);
        Player author = entityManager.getPlayerBySession(session);
        ChatMessage chatMessage = new ChatMessage(author, message);
        author.chat(chatMessage);
    }
}
