package dev.sophiawhite.command.network.outbound.map;

import dev.sophiawhite.command.network.outbound.OutboundNetworkCommand;
import dev.sophiawhite.level.Map;

public class OutboundNetworkCommandCommandMapLoad implements OutboundNetworkCommand {

    private static String description;

    private Map map;

    public OutboundNetworkCommandCommandMapLoad(Map map){
        this.map = map;
    }

    public static String getDescription() {
        return "Forces the client to change its active map";
    }

    public static String getLabel() {
        return "map load";
    }

    public static String getHelp() {
        return "<map_id>";
    }

    @Override
    public String toString(){
        return String.format("%s %s", getLabel(), map.getPropertyList().getString("id"));
    }

}
