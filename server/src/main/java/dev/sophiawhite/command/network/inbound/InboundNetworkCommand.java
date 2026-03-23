package dev.sophiawhite.command.network.inbound;

import jakarta.websocket.Session;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class InboundNetworkCommand {

    private static final List<InboundNetworkCommand> networkCommands = new ArrayList<InboundNetworkCommand>();

    public static final CommandLogin networkCommandLogin = new CommandLogin();

    private final String label;
    private final String description;
    private final String help;

    public InboundNetworkCommand(String label, String description, String help) {
        networkCommands.add(this);
        this.label = label;
        this.description = description;
        this.help = help;
    }

    public String getLabel(){
        return this.label;
    }

    public String getDescription(){
        return this.description;
    }

    public String getHelp(){
        return this.help;
    }

    public abstract boolean onCommand(Session session, String[] args);

    public static boolean parseCommand(Session session, String commandString) {

        String[] splits = commandString.split(" ");

        String label = splits[0];

        String[] args  = splits.length > 1 ? Arrays.copyOfRange(splits, 1, splits.length) : new String[0];



        for(InboundNetworkCommand command: networkCommands) {
            if(command.label.equals(label)) {
                return command.onCommand(session, args);
            }
        }

        return false;

    }

    //broadcastGlobal
    //broadCastMap(TiledMap map, String message)
    //broadcastMapRadius(TiledMap map, int x, int y, int radius)
    //broadCastToPlayerList


}
