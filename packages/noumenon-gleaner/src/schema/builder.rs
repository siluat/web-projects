use std::collections::HashSet;
use std::fs::File;
use std::path::Path;

use super::error::SchemaError;
use super::types::{Field, FieldType, Schema, SchemaMap};
use super::utils::{
    extract_schema_name_from_path, is_likely_custom_type, is_special_type, parse_bit_value,
};
use crate::constants::{BASIC_TYPES, FIELD_DESCRIPTIONS_HEADER, FIELD_NAMES_HEADER};

pub struct SchemaBuilder {
    schemas: SchemaMap,
    processing_stack: HashSet<String>, // For circular dependency detection
}

impl SchemaBuilder {
    pub fn new() -> Self {
        Self {
            schemas: SchemaMap::new(),
            processing_stack: HashSet::new(),
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

        self.build_schema_recursive(&schema_name, path.parent().unwrap_or(Path::new(".")), path)
    }

    fn build_schema_recursive(
        &mut self,
        schema_name: &str,
        base_dir: &Path,
        source_file: &Path,
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
        self.processing_stack.insert(schema_name.to_string());

        let csv_path = base_dir.join(format!("{}.csv", schema_name));

        if !csv_path.exists() {
            // Remove from processing stack before returning error
            self.processing_stack.remove(&schema_name.to_string());
            return Err(SchemaError::FileNotFound {
                path: csv_path.to_string_lossy().to_string(),
                source_file: source_file.to_string_lossy().to_string(),
            });
        }

        let schema = self.parse_csv_file(&csv_path, schema_name, base_dir, source_file)?;
        self.schemas.insert(schema_name.to_string(), schema);

        // Remove from processing stack
        self.processing_stack.remove(&schema_name.to_string());

        Ok(schema_name.to_string())
    }

    fn parse_csv_file(
        &mut self,
        csv_path: &Path,
        schema_name: &str,
        base_dir: &Path,
        _source_file: &Path,
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

        // Use header-based detection to find row indices
        let field_names_row = Self::find_field_names_row(&records, csv_path)?;
        let field_descriptions_row = Self::find_field_descriptions_row(&records, csv_path)?;
        let field_types_row = Self::find_field_types_row(&records, csv_path)?;

        let field_names = &records[field_names_row];
        let field_descriptions = &records[field_descriptions_row];
        let field_types = &records[field_types_row];

        if field_names.len() != field_types.len() {
            return Err(SchemaError::InvalidFormat {
                reason: "Field names and types count mismatch".to_string(),
            });
        }

        let mut fields = Vec::new();
        let mut used_names = std::collections::HashSet::new();

        for ((name, description), type_str) in field_names
            .iter()
            .zip(field_descriptions.iter())
            .zip(field_types.iter())
        {
            // Special handling for "Key" description - override type to Key
            let field_type = if description == "Key" {
                FieldType::Key
            } else {
                self.parse_field_type(type_str, base_dir, csv_path)?
            };

            // Determine the best field name to use
            let mut field_name = if description.starts_with('#') {
                // First field with # description becomes "id"
                "id".to_string()
            } else if description.is_empty() {
                // If description is empty, use original name or create meaningful name
                if name == "key" {
                    "id".to_string() // Fallback for key field
                } else {
                    // For numeric field names, try to create a meaningful name
                    if name.chars().all(|c| c.is_ascii_digit()) {
                        format!("field{}", name)
                    } else {
                        name.to_string()
                    }
                }
            } else if description == "Key" {
                // Special handling for "Key" fields - treat as special type, use key as field name
                "key".to_string()
            } else {
                Self::sanitize_field_name(description)
            };

            // Handle duplicate field names by adding a suffix
            let mut counter = 1;
            let original_name = field_name.clone();
            while used_names.contains(&field_name) {
                field_name = format!("{}{}", original_name, counter);
                counter += 1;
            }

            used_names.insert(field_name.clone());

            fields.push(Field {
                name: field_name,
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
        current_file: &Path,
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
                        "Key" => Ok(FieldType::Key),
                        "Color" => Ok(FieldType::Color),
                        _ => Ok(FieldType::Custom(trimmed.to_string())), // For future special types
                    }
                }
                // Bit types
                else if trimmed.starts_with("bit&") {
                    let bit_value = parse_bit_value(trimmed)?;
                    Ok(FieldType::Bit(bit_value))
                }
                // Custom types that reference other CSV files
                else if is_likely_custom_type(trimmed) {
                    self.build_schema_recursive(trimmed, base_dir, current_file)?;
                    Ok(FieldType::Custom(trimmed.to_string()))
                }
                // Unknown types default to string
                else {
                    Ok(FieldType::String)
                }
            }
        }
    }

    pub fn get_all_schemas(&self) -> &SchemaMap {
        &self.schemas
    }

    /// Find the row index for field names based on header indicator
    fn find_field_names_row(
        records: &[csv::StringRecord],
        csv_path: &Path,
    ) -> Result<usize, SchemaError> {
        for (i, record) in records.iter().enumerate() {
            if let Some(first_col) = record.get(0) {
                let normalized = first_col.trim_start_matches('\u{feff}').trim();
                if normalized == FIELD_NAMES_HEADER {
                    return Ok(i);
                }
            }
        }
        Err(SchemaError::MissingCsvHeader {
            header: FIELD_NAMES_HEADER.to_string(),
            path: csv_path.display().to_string(),
        })
    }

    /// Find the row index for field descriptions based on header indicator
    fn find_field_descriptions_row(
        records: &[csv::StringRecord],
        csv_path: &Path,
    ) -> Result<usize, SchemaError> {
        let positions: Vec<usize> = records
            .iter()
            .enumerate()
            .filter_map(|(i, record)| {
                record
                    .get(0)
                    .filter(|first_col| first_col.trim() == FIELD_DESCRIPTIONS_HEADER)
                    .map(|_| i)
            })
            .collect();

        match positions.len() {
            0 => Err(SchemaError::MissingCsvHeader {
                header: FIELD_DESCRIPTIONS_HEADER.to_string(),
                path: csv_path.display().to_string(),
            }),
            1 => Ok(positions[0]),
            _ => Err(SchemaError::DuplicateCsvHeader {
                header: FIELD_DESCRIPTIONS_HEADER.to_string(),
                path: csv_path.display().to_string(),
            }),
        }
    }

    /// Find the row index for field types based on basic type detection
    fn find_field_types_row(
        records: &[csv::StringRecord],
        csv_path: &Path,
    ) -> Result<usize, SchemaError> {
        let positions: Vec<usize> = records
            .iter()
            .enumerate()
            .filter_map(|(i, record)| {
                record
                    .get(0)
                    .filter(|first_col| BASIC_TYPES.contains(&first_col.trim()))
                    .map(|_| i)
            })
            .collect();

        match positions.len() {
            0 => Err(SchemaError::MissingCsvHeader {
                header: "field types (basic type)".to_string(),
                path: csv_path.display().to_string(),
            }),
            1 => Ok(positions[0]),
            _ => Err(SchemaError::DuplicateCsvHeader {
                header: "field types (basic type)".to_string(),
                path: csv_path.display().to_string(),
            }),
        }
    }

    pub fn print_schemas(&self) {
        for schema in self.schemas.values() {
            println!("Schema: {}", schema.name);
            for field in &schema.fields {
                println!("  {}: {:?}", field.name, field.field_type);
            }
            println!();
        }
    }

    /// Sanitize field name to make it a valid TypeScript identifier
    fn sanitize_field_name(name: &str) -> String {
        let mut result = String::new();
        let mut first_char = true;

        for ch in name.chars() {
            match ch {
                // Valid identifier characters
                'a'..='z' | 'A'..='Z' | '_' => {
                    result.push(ch);
                    first_char = false;
                }
                '0'..='9' if !first_char => {
                    result.push(ch);
                }
                // Convert various separators to camelCase
                '{' | '}' | ' ' | '-' | '.' => {
                    if !result.is_empty() && !result.ends_with('_') {
                        // Next character should be uppercase for camelCase
                        first_char = false;
                    }
                }
                _ => {
                    // Skip other characters
                }
            }
        }

        // If empty or starts with number, prefix with underscore
        match result.chars().next() {
            None => result = "_".to_string(),
            Some(c) if c.is_ascii_digit() => result = format!("_{}", result),
            _ => {}
        }

        // Convert to camelCase
        Self::to_camel_case(&result)
    }

    /// Convert string to camelCase
    fn to_camel_case(name: &str) -> String {
        if name.is_empty() {
            return name.to_string();
        }

        let mut result = String::new();
        let mut capitalize_next = false;

        for (i, ch) in name.chars().enumerate() {
            if ch == '_' || ch == '-' || ch == ' ' {
                capitalize_next = true;
            } else if capitalize_next && i > 0 {
                result.push(ch.to_ascii_uppercase());
                capitalize_next = false;
            } else {
                result.push(if i == 0 { ch.to_ascii_lowercase() } else { ch });
                capitalize_next = false;
            }
        }

        result
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
        let content = "key,0,1,2\n#,Name,Level,IsActive\nint32,str,byte,bool\n1,\"Test\",10,true";
        let file_path = create_test_csv(&temp_dir, "Basic", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "Basic");

        let schema = &builder.get_all_schemas()["Basic"];
        assert_eq!(schema.name, "Basic");
        assert_eq!(schema.fields.len(), 4);

        assert_eq!(schema.fields[0].name, "id");
        assert_eq!(schema.fields[0].field_type, FieldType::Int32);

        assert_eq!(schema.fields[1].name, "name");
        assert_eq!(schema.fields[1].field_type, FieldType::String);

        assert_eq!(schema.fields[2].name, "level");
        assert_eq!(schema.fields[2].field_type, FieldType::Byte);

        assert_eq!(schema.fields[3].name, "isActive");
        assert_eq!(schema.fields[3].field_type, FieldType::Bool);
    }

    #[test]
    fn test_recursive_schema_building() {
        let temp_dir = TempDir::new().unwrap();

        // Create main item schema
        let item_content = "key,0,1\n#,Name,Category\nint32,str,ItemCategory\n1,\"Sword\",1";
        create_test_csv(&temp_dir, "Item", item_content);

        // Create referenced category schema
        let category_content = "key,0\n#,Name\nint32,str\n1,\"Weapon\"";
        create_test_csv(&temp_dir, "ItemCategory", category_content);

        let mut builder = SchemaBuilder::new();
        let item_path = temp_dir.path().join("Item.csv");
        let result = builder.build_schema_from_file(&item_path);

        assert!(result.is_ok());

        // Check that both schemas were created
        let all_schemas = builder.get_all_schemas();
        assert_eq!(all_schemas.len(), 2);

        let item_schema = &builder.get_all_schemas()["Item"];
        assert_eq!(
            item_schema.fields[2].field_type,
            FieldType::Custom("ItemCategory".to_string())
        );

        let category_schema = &builder.get_all_schemas()["ItemCategory"];
        assert_eq!(category_schema.name, "ItemCategory");
        assert_eq!(category_schema.fields.len(), 2);
    }

    #[test]
    fn test_circular_dependency_allowed() {
        let temp_dir = TempDir::new().unwrap();

        // Create A that references B
        let a_content = "key,0\n#,RefB\nint32,TypeB\n1,1";
        create_test_csv(&temp_dir, "TypeA", a_content);

        // Create B that references A (circular dependency should now be allowed)
        let b_content = "key,0\n#,RefA\nint32,TypeA\n1,1";
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
        let type_a_schema = &builder.get_all_schemas()["TypeA"];
        assert_eq!(type_a_schema.name, "TypeA");
        assert_eq!(
            type_a_schema.fields[1].field_type,
            FieldType::Custom("TypeB".to_string())
        );

        // Verify TypeB schema
        let type_b_schema = &builder.get_all_schemas()["TypeB"];
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
        let classjob_content = "key,0,1\n#,Name,Parent\nint32,str,ClassJob\n1,\"Gladiator\",0";
        create_test_csv(&temp_dir, "ClassJob", classjob_content);

        let mut builder = SchemaBuilder::new();
        let classjob_path = temp_dir.path().join("ClassJob.csv");
        let result = builder.build_schema_from_file(&classjob_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "ClassJob");

        let schema = &builder.get_all_schemas()["ClassJob"];
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
        let content = "key,0,1,2\n#,Name,Icon,Description\nint32,str,Image,str\n1,\"Sword\",\"021001\",\"A basic sword\"";
        let file_path = create_test_csv(&temp_dir, "Item", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "Item");

        let schema = &builder.get_all_schemas()["Item"];
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
        let content = "key,0,1,2,3,4\n#,Name,Icon,Level,Active,Category\nint32,str,Image,byte,bool,ItemCategory\n1,\"Test Item\",\"65002\",10,true,1";

        // Create the main schema
        create_test_csv(&temp_dir, "MixedItem", content);

        // Create the referenced custom type
        let category_content = "key,0\n#,Name\nint32,str\n1,\"Weapon\"";
        create_test_csv(&temp_dir, "ItemCategory", category_content);

        let mut builder = SchemaBuilder::new();
        let item_path = temp_dir.path().join("MixedItem.csv");
        let result = builder.build_schema_from_file(&item_path);

        assert!(result.is_ok());

        // Check main schema
        let item_schema = &builder.get_all_schemas()["MixedItem"];
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
        let category_schema = &builder.get_all_schemas()["ItemCategory"];
        assert_eq!(category_schema.name, "ItemCategory");
        assert_eq!(category_schema.fields.len(), 2);
    }

    #[test]
    fn test_special_types_parsing() {
        let temp_dir = TempDir::new().unwrap();
        let content =
            "key,0,1,2\n#,Name,Icon,Ref\nint32,str,Image,Row\n1,\"Test Item\",\"021001\",0";
        let file_path = create_test_csv(&temp_dir, "SpecialTypes", content);

        let mut builder = SchemaBuilder::new();
        let result = builder.build_schema_from_file(&file_path);

        assert!(result.is_ok());
        let schema_name = result.unwrap();
        assert_eq!(schema_name, "SpecialTypes");

        let schema = &builder.get_all_schemas()["SpecialTypes"];
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
