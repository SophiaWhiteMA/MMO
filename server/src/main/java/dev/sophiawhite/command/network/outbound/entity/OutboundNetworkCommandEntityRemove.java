package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Entity;

public class OutboundNetworkCommandEntityRemove implements OutboundNetworkCommand {

    Entity entity;

    public OutboundNetworkCommandEntityRemove(Entity e) {
        this.entity = e;
    }

    @Override
    public String toString(){
        return String.format("entity remove %s", entity.getUUID().toString());
    }


}

