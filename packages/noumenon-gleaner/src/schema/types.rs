use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FieldType {
    // Basic types
    String,
    Int32,
    Uint32,
    Int16,
    Uint16,
    Byte,
    SByte,
    Float,
    Bool,
    Bit(u8), // bit&01, bit&02, bit&FF, etc. (hexadecimal values)

    // Special types for game data
    Image, // UI image file path - preserved as-is without processing
    Row,   // Row type - preserved as-is without processing
    Key,   // Key type - string identifier preserved as-is without processing
    Color, // Color type - converted to number (color code)

    // Custom types that reference other CSV files
    Custom(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Field {
    pub name: String,
    pub field_type: FieldType,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Schema {
    pub name: String,
    pub fields: Vec<Field>,
}

pub type SchemaMap = HashMap<String, Schema>;

#[cfg(test)]
mod tests {
    use super::*;

    // Tests for the basic type system functionality
    #[test]
    fn test_field_type_equality() {
        assert_eq!(FieldType::Image, FieldType::Image);
        assert_eq!(FieldType::Row, FieldType::Row);
        assert_eq!(FieldType::Color, FieldType::Color);
        assert_ne!(FieldType::Image, FieldType::Row);
        assert_ne!(FieldType::Color, FieldType::Image);
        assert_ne!(FieldType::Color, FieldType::Row);
    }

    #[test]
    fn test_field_creation() {
        let field = Field {
            name: "test_field".to_string(),
            field_type: FieldType::Image,
        };

        assert_eq!(field.name, "test_field");
        assert_eq!(field.field_type, FieldType::Image);
    }

    #[test]
    fn test_color_field_creation() {
        let color_field = Field {
            name: "background_color".to_string(),
            field_type: FieldType::Color,
        };

        assert_eq!(color_field.name, "background_color");
        assert_eq!(color_field.field_type, FieldType::Color);
    }

    #[test]
    fn test_field_equality() {
        let field1 = Field {
            name: "test_field".to_string(),
            field_type: FieldType::Image,
        };
        let field2 = Field {
            name: "test_field".to_string(),
            field_type: FieldType::Image,
        };
        let field3 = Field {
            name: "different_field".to_string(),
            field_type: FieldType::Image,
        };

        assert_eq!(field1, field2);
        assert_ne!(field1, field3);
    }

    #[test]
    fn test_schema_equality() {
        let field1 = Field {
            name: "id".to_string(),
            field_type: FieldType::Int32,
        };
        let field2 = Field {
            name: "name".to_string(),
            field_type: FieldType::String,
        };

        let schema1 = Schema {
            name: "TestSchema".to_string(),
            fields: vec![field1.clone(), field2.clone()],
        };
        let schema2 = Schema {
            name: "TestSchema".to_string(),
            fields: vec![field1, field2],
        };
        let schema3 = Schema {
            name: "DifferentSchema".to_string(),
            fields: vec![],
        };

        assert_eq!(schema1, schema2);
        assert_ne!(schema1, schema3);
    }
}
