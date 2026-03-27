package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Player;

public class CommandEntitySetPlayer implements OutboundNetworkCommand {

    private Player player;

    public CommandEntitySetPlayer(Player player){
        this.player = player;
    }

    @Override
    public String toString(){
        return String.format("entity setplayer %s", this.player.getUUID().toString());
    }

}
