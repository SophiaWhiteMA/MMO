package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Entity;

public class OutboundNetworkCommandEntityAdd implements OutboundNetworkCommand {

    Entity entity;

    public OutboundNetworkCommandEntityAdd(Entity e) {
        this.entity = e;
    }

    @Override
    public String toString(){
        return String.format("entity add %s %s %s %s %s", entity.getUUID().toString(), "entity", entity.getX(), entity.getY(), true);
    }


}

