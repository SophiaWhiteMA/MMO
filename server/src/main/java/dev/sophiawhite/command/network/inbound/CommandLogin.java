package dev.sophiawhite.command.network.inbound;

import dev.sophiawhite.command.network.outbound.entity.CommandEntitySetPlayer;
import dev.sophiawhite.entity.Player;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;
import jakarta.websocket.Session;

public class CommandLogin extends InboundNetworkCommand {

    private static final String label = "login";
    private static final String description = "First command used in the protocol. Client authenticates with server.";
    private static final String help = "login <username> <password>";

    private final MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();


    public CommandLogin() {
        super(label, description, help);
    }

    @Override
    public void onCommand(Session session, String[] args) throws Exception {

        if(args.length != 2) {
            return;
        }

        String username = args[0];
        String password = args[1];

        MapInstance mapInstance = mapInstanceManager.getInstances().getLast();
        Player player = new Player(session);
        player.setDisplayName(username);
        player.setMapInstance(mapInstance);
        player.sendNetworkCommand(new CommandEntitySetPlayer(player));

    }
}
