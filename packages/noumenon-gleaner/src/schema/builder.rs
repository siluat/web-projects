use std::fs::File;
use std::path::Path;

use super::error::SchemaError;
use super::types::{Field, FieldType, Schema, SchemaMap};
use super::utils::{
    extract_schema_name_from_path, is_likely_custom_type, is_special_type, parse_bit_value,
};
use crate::constants::{FIELD_DESCRIPTIONS_ROW, FIELD_NAMES_ROW, FIELD_TYPES_ROW};

pub struct SchemaBuilder {
    schemas: SchemaMap,
    processing_stack: Vec<String>, // For circular dependency detection
}

impl SchemaBuilder {
    pub fn new() -> Self {
        Self {
            schemas: SchemaMap::new(),
            processing_stack: Vec::new(),
        }
    }

    /// High-level function to build schemas and print results
    pub fn build_and_print_schemas<P: AsRef<Path>>(
        &mut self,
        file_path: P,
    ) -> Result<String, SchemaError> {
        let main_schema_name = self.build_schema_from_file(file_path)?;

        println!("\n=== Generated Schemas ===");
        self.print_schemas();

        Ok(main_schema_name)
    }

    pub fn build_schema_from_file<P: AsRef<Path>>(
        &mut self,
        file_path: P,
    ) -> Result<String, SchemaError> {
        let path = file_path.as_ref();
        let schema_name =
            extract_schema_name_from_path(path).ok_or_else(|| SchemaError::InvalidFormat {
                reason: "Cannot extract schema name from file path".to_string(),
            })?;

        self.build_schema_recursive(&schema_name, path.parent().unwrap_or(Path::new(".")))
    }

    fn build_schema_recursive(
        &mut self,
        schema_name: &str,
        base_dir: &Path,
    ) -> Result<String, SchemaError> {
        // Return if already processed
        if self.schemas.contains_key(schema_name) {
            return Ok(schema_name.to_string());
        }

        // Check for circular dependency
        if self.processing_stack.contains(&schema_name.to_string()) {
            // If we're already processing this schema, just return the name
            // This allows circular references to be resolved later
            return Ok(schema_name.to_string());
        }

        // Add to processing stack
        self.processing_stack.push(schema_name.to_string());

        let csv_path = base_dir.join(format!("{}.csv", schema_name));

        if !csv_path.exists() {
            // Remove from processing stack before returning error
            self.processing_stack.pop();
            return Err(SchemaError::FileNotFound {
                path: csv_path.to_string_lossy().to_string(),
            });
        }

        let schema = self.parse_csv_file(&csv_path, schema_name, base_dir)?;
        self.schemas.insert(schema_name.to_string(), schema);

        // Remove from processing stack
        self.processing_stack.pop();

        Ok(schema_name.to_string())
    }

    fn parse_csv_file(
        &mut self,
        csv_path: &Path,
        schema_name: &str,
        base_dir: &Path,
    ) -> Result<Schema, SchemaError> {
        let file = File::open(csv_path)?;
        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(false)
            .from_reader(file);

        let records: Vec<_> = rdr.records().collect::<Result<_, _>>()?;

        if records.len() < 3 {
            return Err(SchemaError::InvalidFormat {
                reason: "CSV file must have at least 3 rows (names, descriptions, types)"
                    .to_string(),
            });
        }

        let field_names = &records[FIELD_NAMES_ROW];
        let _field_descriptions = &records[FIELD_DESCRIPTIONS_ROW]; // Skip for now
        let field_types = &records[FIELD_TYPES_ROW];

        if field_names.len() != field_types.len() {
            return Err(SchemaError::InvalidFormat {
                reason: "Field names and types count mismatch".to_string(),
            });
        }

        let mut fields = Vec::new();
        for (name, type_str) in field_names.iter().zip(field_types.iter()) {
            let field_type = self.parse_field_type(type_str, base_dir)?;
            fields.push(Field {
                name: name.to_string(),
                field_type,
            });
        }

        Ok(Schema {
            name: schema_name.to_string(),
            fields,
        })
    }

    fn parse_field_type(
        &mut self,
        type_str: &str,
        base_dir: &Path,
    ) -> Result<FieldType, SchemaError> {
        let trimmed = type_str.trim();

        // Basic types
        match trimmed {
            "str" => Ok(FieldType::String),
            "int32" => Ok(FieldType::Int32),
            "uint32" => Ok(FieldType::Uint32),
            "int16" => Ok(FieldType::Int16),
            "uint16" => Ok(FieldType::Uint16),
            "byte" => Ok(FieldType::Byte),
            "sbyte" => Ok(FieldType::SByte),
            "float" => Ok(FieldType::Float),
            "bool" => Ok(FieldType::Bool),
            _ => {
                // Special types with unique processing rules
                if is_special_type(trimmed) {
                    match trimmed {
                        "Image" => Ok(FieldType::Image),
                        "Row" => Ok(FieldType::Row),
                        _ => Ok(FieldType::Custom(trimmed.to_string())), // For future special types
                    }
                }
                // Bit types
                else if trimmed.starts_with("bit&") {
                    let bit_value = parse_bit_value(trimmed);
                    Ok(FieldType::Bit(bit_value))
                }
                // Custom types that reference other CSV files
                else if is_likely_custom_type(trimmed) {
                    self.build_schema_recursive(trimmed, base_dir)?;
                    Ok(FieldType::Custom(trimmed.to_string()))
                }
                // Unknown types default to string
                else {
                    Ok(FieldType::String)
                }
            }
        }
    }

    #[allow(dead_code)]
    pub fn get_schema(&self, name: &str) -> Option<&Schema> {
        self.schemas.get(name)
    }

    #[allow(dead_code)]
    pub fn get_all_schemas(&self) -> &SchemaMap {
        &self.schemas
    }

    pub fn print_schemas(&self) {
        for (_, schema) in &self.schemas {
            println!("Schema: {}", schema.name);
            for field in &schema.fields {
                match &field.field_type {
                    FieldType::Image => {
                        println!("  {}: {:?}", field.name, field.field_type);
                        // Show example of how Image values are processed
                        if let Some(example_path) = FieldType::process_image_path("65002") {
                            println!("    Example: 65002 -> {}", example_path);
                        }
                    }
                    FieldType::Row => {
                        println!("  {}: {:?}", field.name, field.field_type);
                        println!("    Note: Row type (processing rules TBD)");
                        println!("    TODO: Implement Row processing logic in next phase");
                    }
                    _ => {
                        println!("  {}: {:?}", field.name, field.field_type);
                    }
                }
            }
            println!();
        }
    }
}

impl Default for SchemaBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;
    use tempfile::TempDir;

    fn create_test_csv(dir: &TempDir, name: &str, content: &str) -> std::path::PathBuf {
        let file_path = dir.path().join(format!("{}.csv", name));
        let mut file = fs::File::create(&file_path).unwrap();
        file.write_all(content.as_bytes()).unwrap();
        file_path
    }

    #[test]
    fn test_basic_types_schema() {
        let temp_dir = TempDir::new().unwrap();
        let content =
            "id,name,level,active\n#,Name,Level,IsActive\nint32,str,byte,bool\n1,\"Test\",10,true";
        let file_path = create_test_csv(&temp_dir, "Basic", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "Basic");

        let schema = builder.get_schema("Basic").unwrap();
        assert_eq!(schema.name, "Basic");
        assert_eq!(schema.fields.len(), 4);

        assert_eq!(schema.fields[0].name, "id");
        assert_eq!(schema.fields[0].field_type, FieldType::Int32);

        assert_eq!(schema.fields[1].name, "name");
        assert_eq!(schema.fields[1].field_type, FieldType::String);

        assert_eq!(schema.fields[2].name, "level");
        assert_eq!(schema.fields[2].field_type, FieldType::Byte);

        assert_eq!(schema.fields[3].name, "active");
        assert_eq!(schema.fields[3].field_type, FieldType::Bool);
    }

    #[test]
    fn test_recursive_schema_building() {
        let temp_dir = TempDir::new().unwrap();

        // Create main item schema
        let item_content =
            "id,name,category\n#,Name,Category\nint32,str,ItemCategory\n1,\"Sword\",1";
        create_test_csv(&temp_dir, "Item", item_content);

        // Create referenced category schema
        let category_content = "id,name\n#,Name\nbyte,str\n1,\"Weapon\"";
        create_test_csv(&temp_dir, "ItemCategory", category_content);

        let mut builder = SchemaBuilder::new();
        let item_path = temp_dir.path().join("Item.csv");
        let result = builder.build_schema_from_file(&item_path);

        assert!(result.is_ok());

        // Check that both schemas were created
        let all_schemas = builder.get_all_schemas();
        assert_eq!(all_schemas.len(), 2);

        let item_schema = builder.get_schema("Item").unwrap();
        assert_eq!(
            item_schema.fields[2].field_type,
            FieldType::Custom("ItemCategory".to_string())
        );

        let category_schema = builder.get_schema("ItemCategory").unwrap();
        assert_eq!(category_schema.name, "ItemCategory");
        assert_eq!(category_schema.fields.len(), 2);
    }

    #[test]
    fn test_circular_dependency_allowed() {
        let temp_dir = TempDir::new().unwrap();

        // Create A that references B
        let a_content = "id,ref_b\n#,RefB\nint32,TypeB\n1,1";
        create_test_csv(&temp_dir, "TypeA", a_content);

        // Create B that references A (circular dependency should now be allowed)
        let b_content = "id,ref_a\n#,RefA\nint32,TypeA\n1,1";
        create_test_csv(&temp_dir, "TypeB", b_content);

        let mut builder = SchemaBuilder::new();
        let a_path = temp_dir.path().join("TypeA.csv");
        let result = builder.build_schema_from_file(&a_path);

        // Circular dependency should now be allowed
        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "TypeA");

        // Check that both schemas were created
        let all_schemas = builder.get_all_schemas();
        assert_eq!(all_schemas.len(), 2);

        // Verify TypeA schema
        let type_a_schema = builder.get_schema("TypeA").unwrap();
        assert_eq!(type_a_schema.name, "TypeA");
        assert_eq!(
            type_a_schema.fields[1].field_type,
            FieldType::Custom("TypeB".to_string())
        );

        // Verify TypeB schema
        let type_b_schema = builder.get_schema("TypeB").unwrap();
        assert_eq!(type_b_schema.name, "TypeB");
        assert_eq!(
            type_b_schema.fields[1].field_type,
            FieldType::Custom("TypeA".to_string())
        );
    }

    #[test]
    fn test_self_reference_allowed() {
        let temp_dir = TempDir::new().unwrap();

        // Create ClassJob that references itself (self-reference should be allowed)
        let classjob_content =
            "id,name,parent\n#,Name,Parent\nint32,str,ClassJob\n1,\"Gladiator\",0";
        create_test_csv(&temp_dir, "ClassJob", classjob_content);

        let mut builder = SchemaBuilder::new();
        let classjob_path = temp_dir.path().join("ClassJob.csv");
        let result = builder.build_schema_from_file(&classjob_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "ClassJob");

        let schema = builder.get_schema("ClassJob").unwrap();
        assert_eq!(schema.name, "ClassJob");
        assert_eq!(schema.fields.len(), 3);

        // Check that the parent field is correctly typed as Custom("ClassJob")
        assert_eq!(schema.fields[2].name, "parent");
        assert_eq!(
            schema.fields[2].field_type,
            FieldType::Custom("ClassJob".to_string())
        );
    }

    #[test]
    fn test_image_type_parsing() {
        let temp_dir = TempDir::new().unwrap();
        let content = "id,name,icon,description\n#,Name,Icon,Description\nint32,str,Image,str\n1,\"Sword\",\"021001\",\"A basic sword\"";
        let file_path = create_test_csv(&temp_dir, "Item", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "Item");

        let schema = builder.get_schema("Item").unwrap();
        assert_eq!(schema.name, "Item");
        assert_eq!(schema.fields.len(), 4);

        assert_eq!(schema.fields[0].name, "id");
        assert_eq!(schema.fields[0].field_type, FieldType::Int32);

        assert_eq!(schema.fields[1].name, "name");
        assert_eq!(schema.fields[1].field_type, FieldType::String);

        assert_eq!(schema.fields[2].name, "icon");
        assert_eq!(schema.fields[2].field_type, FieldType::Image);

        assert_eq!(schema.fields[3].name, "description");
        assert_eq!(schema.fields[3].field_type, FieldType::String);
    }

    #[test]
    fn test_mixed_types_with_image() {
        let temp_dir = TempDir::new().unwrap();
        let content = "id,name,icon,level,active,category\n#,Name,Icon,Level,Active,Category\nint32,str,Image,byte,bool,ItemCategory\n1,\"Test Item\",\"65002\",10,true,1";

        // Create the main schema
        create_test_csv(&temp_dir, "MixedItem", content);

        // Create the referenced custom type
        let category_content = "id,name\n#,Name\nbyte,str\n1,\"Weapon\"";
        create_test_csv(&temp_dir, "ItemCategory", category_content);

        let mut builder = SchemaBuilder::new();
        let item_path = temp_dir.path().join("MixedItem.csv");
        let result = builder.build_schema_from_file(&item_path);

        assert!(result.is_ok());

        // Check main schema
        let item_schema = builder.get_schema("MixedItem").unwrap();
        assert_eq!(item_schema.fields.len(), 6);

        assert_eq!(item_schema.fields[0].field_type, FieldType::Int32);
        assert_eq!(item_schema.fields[1].field_type, FieldType::String);
        assert_eq!(item_schema.fields[2].field_type, FieldType::Image);
        assert_eq!(item_schema.fields[3].field_type, FieldType::Byte);
        assert_eq!(item_schema.fields[4].field_type, FieldType::Bool);
        assert_eq!(
            item_schema.fields[5].field_type,
            FieldType::Custom("ItemCategory".to_string())
        );

        // Check that custom type schema was also created
        let category_schema = builder.get_schema("ItemCategory").unwrap();
        assert_eq!(category_schema.name, "ItemCategory");
        assert_eq!(category_schema.fields.len(), 2);
    }

    #[test]
    fn test_special_types_parsing() {
        let temp_dir = TempDir::new().unwrap();
        let content =
            "id,name,icon,ref\n#,Name,Icon,Ref\nint32,str,Image,Row\n1,\"Test Item\",\"021001\",0";
        let file_path = create_test_csv(&temp_dir, "SpecialTypes", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "SpecialTypes");

        let schema = builder.get_schema("SpecialTypes").unwrap();
        assert_eq!(schema.name, "SpecialTypes");
        assert_eq!(schema.fields.len(), 4);

        assert_eq!(schema.fields[0].name, "id");
        assert_eq!(schema.fields[0].field_type, FieldType::Int32);

        assert_eq!(schema.fields[1].name, "name");
        assert_eq!(schema.fields[1].field_type, FieldType::String);

        assert_eq!(schema.fields[2].name, "icon");
        assert_eq!(schema.fields[2].field_type, FieldType::Image);

        assert_eq!(schema.fields[3].name, "ref");
        assert_eq!(schema.fields[3].field_type, FieldType::Row);
    }
}
