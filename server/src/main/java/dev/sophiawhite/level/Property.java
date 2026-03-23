package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

public class Property {

    private String name;
    private String type;
    private String value;

    public Property(String name, String type, String value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }

    public String getName(){
        return this.name;
    }

    public String getType(){
        return this.type;
    }

    public String getValue(){
        return this.value;
    }

    public static Property singlePropertyFromJson(JsonNode property) {
        String name = property.path("name").asText();
        String type = property.path("type").asText();
        String value = property.path("value").asText();
        return new Property(name, type, value);
    }

    /**
     *
     * @param properties Array OR single JSON object expected.
     * @return List of all properties in the array, or the single property provided if input was not array.
     */
    public static List<Property> fromJson(JsonNode properties) {

        List<Property> output = new ArrayList<Property>();

        if (properties.isArray()) {
            for (JsonNode property : properties) {
                output.add(singlePropertyFromJson(property));
            }
        } else {
            output.add(singlePropertyFromJson(properties));
        }

        return output;
    }


}
