package dev.sophiawhite.command.network.outbound;

import jakarta.websocket.Session;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public interface OutboundNetworkCommand {

   public String toString();

    public static String getDescription(){
        return null;
    };

    public static String getLabel() {
        return null;
    }

   public static String getHelp(){
        return null;
   };

}
