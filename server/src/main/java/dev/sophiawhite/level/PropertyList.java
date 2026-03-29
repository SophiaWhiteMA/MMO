package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

public class PropertyList {

    private List<Property> properties;

    public PropertyList(List<Property> properties) {
        this.properties = properties;
    }

    public PropertyList(){
        this.properties = new ArrayList<>();
    }

    public List<Property> getProperties(){
        return this.properties;
    }

    /**
     *
     * @param properties Array of Tiled properties
     * @return List of all properties
     */
    public static PropertyList fromJson(JsonNode properties) {
        List<Property> output = new ArrayList<Property>();
        for (JsonNode property : properties)
            output.add(Property.singlePropertyFromJson(property));
        return new PropertyList(output);
    }

    public boolean getBoolean(String key) {
        for (Property property : this.properties) {
            if (property.getName().equals(key)) {
                String value = property.getValue();
                return Boolean.parseBoolean(value);
            }
        }
        return false;
    }

    public String getString(String key){
        for (Property property : this.properties) {
            if (property.getName().equals(key)) {
                return property.getValue();
            }
        }
        return null;
    }

    public int getInt(String key){
        for (Property property : this.properties) {
            if (property.getName().equals(key)) {
                return Integer.parseInt(property.getValue());
            }
        }
        return -1;
    }

    public double getDouble(String key){
        for (Property property : this.properties) {
            if (property.getName().equals(key)) {
                return Double.parseDouble(property.getValue());
            }
        }
        return -1;
    }


}
