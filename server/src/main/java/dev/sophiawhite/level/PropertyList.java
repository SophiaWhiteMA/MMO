package dev.sophiawhite.level;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

public class PropertyList {

    private List<Property> properties;

    public PropertyList(List<Property> properties) {
        this.properties = properties;
    }

    public List<Property> getProperties(){
        return this.properties;
    }

    /**
     *
     * @param properties Array OR single JSON object expected.
     * @return List of all properties in the array, or the single property provided if input was not array.
     */
    public static PropertyList fromJson(JsonNode properties) {

        List<Property> output = new ArrayList<Property>();

        if (properties.isArray()) {

            for (JsonNode property : properties)
                output.add(Property.singlePropertyFromJson(property));
            return new PropertyList(output);

        } else {
            return new PropertyList(Property.fromJson(properties));
        }


    }

    @SuppressWarnings("unchecked")
    public <T> T getProperty(Class<T> classType, String key) {

        for (Property property : this.properties) {
            if (property.getName().equals(key)) {
                Object value = property.getValue();

                if (classType.isInstance(value)) {
                    return classType.cast(value);
                }

                if (value instanceof String strValue) {
                    if (classType == Boolean.class || classType == boolean.class) {
                        return (T) Boolean.valueOf(strValue);
                    }
                    if (classType == Integer.class || classType == int.class) {
                        return (T) Integer.valueOf(strValue);
                    }
                    if (classType == Float.class || classType == float.class) {
                        return (T) Float.valueOf(strValue);
                    }
                    if (classType == Double.class || classType == double.class) {
                        return (T) Double.valueOf(strValue);
                    }
                }

                // 3. Fallback: return null or throw an error if conversion isn't supported
                return null;
            }
        }
        return null;
    }

}
