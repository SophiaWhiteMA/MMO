package dev.sophiawhite.command.network.outbound.chat;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Player;

public class OutboundNetworkCommandChatAdd implements OutboundNetworkCommand  {

    private String message;
    private Player author;

    public OutboundNetworkCommandChatAdd(Player author, String message) {
        this.author = author;
        this.message = message;
    }

    @Override
    public String toString(){
        return String.format("chat add %s %s", author.getUUID(), message);
    }

}


