package dev.sophiawhite.command.network.inbound;

import dev.sophiawhite.command.network.inbound.chat.InboundNetworkCommandChat;
import dev.sophiawhite.command.network.inbound.player.InboundNetworkCommandLogin;
import dev.sophiawhite.command.network.inbound.player.InboundNetworkCommandPlayerMove;
import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import jakarta.websocket.Session;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class InboundNetworkCommand {

    private static final List<InboundNetworkCommand> networkCommands = new ArrayList<InboundNetworkCommand>();

    private static final InboundNetworkCommandLogin networkCommandLogin = new InboundNetworkCommandLogin();
    private static final InboundNetworkCommandPlayerMove networkCommandMove = new InboundNetworkCommandPlayerMove();
    private static final InboundNetworkCommandChat networkCommandChatSend = new InboundNetworkCommandChat();

    private static final Logger logger = Logger.getInstance();

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

    public abstract void onCommand(Session session, String[] args) throws Exception;

    public static void parseCommand(Session session, String commandString) {

        String[] splits = commandString.split(" ");

        String label = splits[0];

        String[] args  = splits.length > 1 ? Arrays.copyOfRange(splits, 1, splits.length) : new String[0];

        for(InboundNetworkCommand command: networkCommands) {
            if(command.label.equals(label)) {
                try {
                    command.onCommand(session, args);
                } catch (Exception exc) {
                    logger.log(LogLevel.NETWORK, "Error parsing network command.");
                    exc.printStackTrace();
                }
                return;
            }
        }

    }

    //broadcastGlobal
    //broadCastMap(TiledMap map, String message)
    //broadcastMapRadius(TiledMap map, int x, int y, int radius)
    //broadCastToPlayerList


}
