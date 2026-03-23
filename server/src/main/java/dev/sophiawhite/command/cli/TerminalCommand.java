package dev.sophiawhite.command.cli;

import dev.sophiawhite.logging.LogLevel;
import dev.sophiawhite.logging.Logger;
import jakarta.websocket.Session;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class TerminalCommand {

    private static final List<TerminalCommand> networkCommands = new ArrayList<TerminalCommand>();
    private static final Logger logger = Logger.getInstance();

    private final String label;
    private final String description;
    private final String help;

    public TerminalCommand(String label, String description, String help) {
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

    public abstract boolean onCommand(String[] args);

    public static boolean parseCommand(String commandString) {

        String[] splits = commandString.split(" ");

        String label = splits[0];

        String[] args  = splits.length > 1 ? Arrays.copyOfRange(splits, 1, splits.length) : new String[0];

        for(TerminalCommand command: networkCommands) {
            if(command.label.equals(label)) {
                return command.onCommand(args);
            }
        }

        logger.log(LogLevel.ERROR, String.format("Unrecognized command '%s'", label));

        return false;

    }

}
