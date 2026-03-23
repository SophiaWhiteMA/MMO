package dev.sophiawhite.command.network.outbound;

import dev.sophiawhite.level.Map;

public class CommandLoadMap implements OutboundNetworkCommand {

    private static String description;

    private Map map;

    public CommandLoadMap(Map map){
        this.map = map;
    }

    public static String getDescription() {
        return "Forces the client to change its active map";
    }

    public static String getLabel() {
        return "loadmap";
    }

    public static String getHelp() {
        return "<map_id>";
    }

    @Override
    public String toString(){
        return String.format("%s %s", getLabel(), map.getPropertyList().getProperty(String.class, "id"));
    }

}
