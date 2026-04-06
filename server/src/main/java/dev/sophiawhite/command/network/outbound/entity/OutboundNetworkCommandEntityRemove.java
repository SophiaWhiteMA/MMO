package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Entity;
import dev.sophiawhite.entity.EntityRemoveReason;

public class OutboundNetworkCommandEntityRemove implements OutboundNetworkCommand {

    private Entity entity;
    private EntityRemoveReason reason;

    public OutboundNetworkCommandEntityRemove(Entity e, EntityRemoveReason reason) {
        this.entity = e;
        this.reason = reason;
    }

    @Override
    public String toString(){
        return String.format("entity remove %s", entity.getUuid().toString());
    }


}

