package dev.sophiawhite.command.network.outbound.chat;

import dev.sophiawhite.chat.ChatMessage;
import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Player;

public class OutboundNetworkCommandChatAdd implements OutboundNetworkCommand  {

    private ChatMessage chatMessage;

    public OutboundNetworkCommandChatAdd(ChatMessage chatMessage) {
        this.chatMessage = chatMessage;
    }

    @Override
    public String toString(){
        return String.format("chat add %s %s", chatMessage.getAuthorId().toString(), chatMessage.getContent());
    }

}


