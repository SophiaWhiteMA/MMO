package dev.sophiawhite.command.network.outbound.entity;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.entity.Entity;

public class OutboundNetworkCommandEntityMove implements OutboundNetworkCommand {

    private Entity entity;
    private int x;
    private int y;

    public OutboundNetworkCommandEntityMove(Entity e, int x, int y) {
        this.entity = e;
        this.x = x;
        this.y = y;
    }

    @Override
    public String toString(){
        return String.format("entity move %s %s %s", this.entity.getUuid().toString(), this.x, this.y);
    }

}
