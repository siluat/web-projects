use std::fs;
use std::path::Path;

use super::error::SchemaError;
use super::types::{FieldType, Schema, SchemaMap};

pub struct TypeScriptGenerator;

impl TypeScriptGenerator {
    pub fn new() -> Self {
        Self
    }

    /// Generate TypeScript interfaces for all schemas and save to file
    pub fn generate_and_save<P: AsRef<Path>>(
        &self,
        schemas: &SchemaMap,
        output_path: P,
    ) -> Result<(), SchemaError> {
        let content = self.generate_typescript_interfaces(schemas);
        fs::write(output_path, content)?;
        Ok(())
    }

    /// Generate TypeScript interfaces for all schemas
    pub fn generate_typescript_interfaces(&self, schemas: &SchemaMap) -> String {
        let mut content = String::new();

        // Add header comment
        content.push_str("// Generated TypeScript interfaces from CSV schemas\n");
        content.push_str("// This file is auto-generated. Do not edit manually.\n\n");

        // Add special type definitions
        content.push_str(&self.generate_special_types());
        content.push('\n');

        // Sort schemas by name for consistent output
        let mut sorted_schemas: Vec<&Schema> = schemas.values().collect();
        sorted_schemas.sort_by(|a, b| a.name.cmp(&b.name));

        // Generate interface for each schema
        for schema in sorted_schemas {
            content.push_str(&self.generate_interface(schema));
            content.push('\n');
        }

        content
    }

    /// Generate a single TypeScript interface from a schema
    fn generate_interface(&self, schema: &Schema) -> String {
        let mut interface = String::new();

        interface.push_str(&format!("export interface {} {{\n", schema.name));

        for field in &schema.fields {
            let ts_type = self.field_type_to_typescript(&field.field_type);
            interface.push_str(&format!("  {}: {};\n", field.name, ts_type));
        }

        interface.push_str("}\n");
        interface
    }

    /// Generate special type definitions
    fn generate_special_types(&self) -> String {
        let mut types = String::new();

        types.push_str("// Special type definitions for game data\n");
        types.push_str("/** Image file path identifier */\n");
        types.push_str("export type ImagePath = string;\n\n");

        types.push_str("/** Row reference identifier */\n");
        types.push_str("export type RowId = number;\n\n");

        types.push_str("/** Key identifier string */\n");
        types.push_str("export type KeyString = string;\n\n");

        types
    }

    /// Convert FieldType to TypeScript type
    fn field_type_to_typescript(&self, field_type: &FieldType) -> String {
        match field_type {
            FieldType::String => "string".to_string(),
            FieldType::Int32 | FieldType::Uint32 | FieldType::Int16 | FieldType::Uint16 => {
                "number".to_string()
            }
            FieldType::Byte | FieldType::SByte => "number".to_string(),
            FieldType::Float => "number".to_string(),
            FieldType::Bool => "boolean".to_string(),
            FieldType::Bit(_) => "number".to_string(), // Bit values are treated as numbers
            FieldType::Image => "ImagePath".to_string(), // Use special type
            FieldType::Row => "RowId".to_string(),     // Use special type
            FieldType::Key => "KeyString".to_string(), // Use special type
            FieldType::Custom(type_name) => type_name.clone(), // Reference to another interface
        }
    }
}

impl Default for TypeScriptGenerator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::types::{Field, Schema};
    use std::collections::HashMap;

    fn create_test_schema() -> Schema {
        Schema {
            name: "TestItem".to_string(),
            fields: vec![
                Field {
                    name: "id".to_string(),
                    field_type: FieldType::Int32,
                },
                Field {
                    name: "name".to_string(),
                    field_type: FieldType::String,
                },
                Field {
                    name: "icon".to_string(),
                    field_type: FieldType::Image,
                },
                Field {
                    name: "level".to_string(),
                    field_type: FieldType::Byte,
                },
                Field {
                    name: "active".to_string(),
                    field_type: FieldType::Bool,
                },
                Field {
                    name: "category".to_string(),
                    field_type: FieldType::Custom("ItemCategory".to_string()),
                },
            ],
        }
    }

    #[test]
    fn test_field_type_conversion() {
        let generator = TypeScriptGenerator::new();

        assert_eq!(
            generator.field_type_to_typescript(&FieldType::String),
            "string"
        );
        assert_eq!(
            generator.field_type_to_typescript(&FieldType::Int32),
            "number"
        );
        assert_eq!(
            generator.field_type_to_typescript(&FieldType::Bool),
            "boolean"
        );
        assert_eq!(
            generator.field_type_to_typescript(&FieldType::Image),
            "ImagePath"
        );
        assert_eq!(generator.field_type_to_typescript(&FieldType::Row), "RowId");
        assert_eq!(
            generator.field_type_to_typescript(&FieldType::Key),
            "KeyString"
        );
        assert_eq!(
            generator.field_type_to_typescript(&FieldType::Custom("ItemCategory".to_string())),
            "ItemCategory"
        );
    }

    #[test]
    fn test_interface_generation() {
        let generator = TypeScriptGenerator::new();
        let schema = create_test_schema();
        let interface = generator.generate_interface(&schema);

        let expected = "export interface TestItem {\n  id: number;\n  name: string;\n  icon: ImagePath;\n  level: number;\n  active: boolean;\n  category: ItemCategory;\n}\n";

        assert_eq!(interface, expected);
    }

    #[test]
    fn test_full_typescript_generation() {
        let generator = TypeScriptGenerator::new();
        let mut schemas = HashMap::new();

        // Add main schema
        schemas.insert("TestItem".to_string(), create_test_schema());

        // Add referenced schema
        let category_schema = Schema {
            name: "ItemCategory".to_string(),
            fields: vec![
                Field {
                    name: "id".to_string(),
                    field_type: FieldType::Byte,
                },
                Field {
                    name: "name".to_string(),
                    field_type: FieldType::String,
                },
            ],
        };
        schemas.insert("ItemCategory".to_string(), category_schema);

        let typescript = generator.generate_typescript_interfaces(&schemas);

        assert!(typescript.contains("export interface ItemCategory"));
        assert!(typescript.contains("export interface TestItem"));
        assert!(typescript.contains("category: ItemCategory;"));
        assert!(typescript.contains("icon: ImagePath;"));
        assert!(typescript.contains("export type ImagePath = string;"));
        assert!(typescript.contains("export type RowId = number;"));
        assert!(typescript.contains("export type KeyString = string;"));
        assert!(typescript.starts_with("// Generated TypeScript interfaces"));
    }
}
