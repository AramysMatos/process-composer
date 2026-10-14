import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import liquibase.Liquibase;
import liquibase.Scope;
import liquibase.changelog.ChangeSet;
import java.sql.DriverManager;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.CompositeResourceAccessor;
import liquibase.resource.FileSystemResourceAccessor;
import liquibase.resource.ResourceAccessor;
import liquibase.resource.SearchPathResourceAccessor;

/** Print checksums for changesets in load_process_catalog.xml (offline, no DB). */
public class ComputeLiquibaseChecksum {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Usage: ComputeLiquibaseChecksum <changeSetId>...");
            System.exit(1);
        }
        File projectRoot = new File(".").getCanonicalFile();
        File resourcesRoot = new File(projectRoot, "src/main/resources").getCanonicalFile();
        ResourceAccessor accessor = new FileSystemResourceAccessor(resourcesRoot);
        var conn = DriverManager.getConnection("jdbc:h2:mem:checksum;DB_CLOSE_DELAY=-1", "sa", "");
        try (conn;
                Liquibase liquibase =
                        new Liquibase(
                                "config/liquibase/changelog/20260716130000_load_process_catalog.xml",
                                accessor,
                                DatabaseFactory.getInstance()
                                        .findCorrectDatabaseImplementation(new JdbcConnection(conn)))) {
            List<ChangeSet> changeSets = liquibase.getDatabaseChangeLog().getChangeSets();
            Map<String, Object> scopeValues = new HashMap<>();
            scopeValues.put(Scope.Attr.resourceAccessor.name(), accessor);
            Scope.child(
                    scopeValues,
                    () -> {
                        for (String id : args) {
                            ChangeSet match =
                                    changeSets.stream()
                                            .filter(cs -> cs.getId().equals(id))
                                            .findFirst()
                                            .orElse(null);
                            if (match == null) {
                                System.err.println("Not found: " + id);
                                continue;
                            }
                            System.out.println(
                                    id
                                            + " file="
                                            + match.getFilePath()
                                            + " -> 8:"
                                            + match.generateCheckSum());
                        }
                        return null;
                    });
        }
    }
}
