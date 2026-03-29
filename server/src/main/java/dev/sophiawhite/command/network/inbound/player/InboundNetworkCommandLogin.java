package dev.sophiawhite.command.network.inbound.player;

import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
import dev.sophiawhite.command.network.outbound.entity.CommandEntitySetPlayer;
import dev.sophiawhite.entity.EntityAddReason;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.entity.EntityRemoveReason;
import dev.sophiawhite.entity.Player;
import dev.sophiawhite.level.MapInstance;
import dev.sophiawhite.level.MapInstanceManager;
import jakarta.websocket.Session;

public class InboundNetworkCommandLogin extends InboundNetworkCommand {

    private static final String label = "login";
    private static final String description = "First command used in the protocol. Client authenticates with server.";
    private static final String help = "login <username> <password>";

    private final MapInstanceManager mapInstanceManager = MapInstanceManager.getInstance();
    private EntityManager entityManager = EntityManager.getInstance();


    public InboundNetworkCommandLogin() {
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

        entityManager.assignEntityToMapInstance(player, mapInstance, EntityAddReason.PLAYER_LOGIN, null);
        player.sendNetworkCommand(new CommandEntitySetPlayer(player));

    }
}
