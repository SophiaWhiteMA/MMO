package dev.sophiawhite.command.network.inbound.player;

import dev.sophiawhite.command.network.inbound.InboundNetworkCommand;
import dev.sophiawhite.entity.EntityManager;
import dev.sophiawhite.entity.EntityMovementReason;
import dev.sophiawhite.entity.Player;
import jakarta.websocket.Session;

public class InboundNetworkCommandPlayerMove extends InboundNetworkCommand {

    private static final String label = "move";
    private static final String description = "The player is sending a move request to the server.";
    private static final String help = "move <x> <y>";

    private final EntityManager entityManager = EntityManager.getInstance();


    public InboundNetworkCommandPlayerMove() {
        super(label, description, help);
    }

    @Override
    public void onCommand(Session session, String[] args) throws Exception {
        Player player = entityManager.getPlayerBySession(session);
        int x = Integer.parseInt(args[0]);
        int y = Integer.parseInt(args[1]);
        player.beginPathfinding(x, y);
    }
}
