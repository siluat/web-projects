use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
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
    Bit(u8), // bit&01, bit&02, etc.

    // Special types for game data
    Image, // UI image file path - preserved as-is without processing
    Row,   // Row type - preserved as-is without processing
    Key,   // Key type - string identifier preserved as-is without processing

    // Custom types that reference other CSV files
    Custom(String),
}

#[derive(Debug, Clone)]
pub struct Field {
    pub name: String,
    pub field_type: FieldType,
}

#[derive(Debug, Clone)]
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
        assert_ne!(FieldType::Image, FieldType::Row);
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
}
