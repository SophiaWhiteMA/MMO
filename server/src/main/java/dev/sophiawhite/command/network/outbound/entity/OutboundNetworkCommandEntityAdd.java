package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityAddReason;

public class OutboundNetworkCommandEntityAdd implements OutboundNetworkCommand {

    private Entity entity;
    private EntityAddReason reason;

    public OutboundNetworkCommandEntityAdd(Entity e, EntityAddReason reason) {
        this.entity = e;
        this.reason = reason;
    }

    @Override
    public String toString(){
        assert entity.getLocation() != null;
        return String.format("entity add %s %s %s %s %s", entity.getUuid().toString(), "entity", entity.getLocation().getX(), entity.getLocation().getY(), true);
    }


}

