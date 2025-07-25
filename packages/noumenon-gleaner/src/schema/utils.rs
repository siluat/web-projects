use super::error::SchemaError;
use crate::constants::{BASIC_TYPES, CUSTOM_TYPE_PATTERNS, SPECIAL_TYPES};
use std::path::Path;

/// Determines if a type string represents a likely custom type
/// that should be defined in another CSV file
pub fn is_likely_custom_type(type_str: &str) -> bool {
    let trimmed = type_str.trim();

    // Exclude basic types
    if BASIC_TYPES.contains(&trimmed) {
        return false;
    }

    // Exclude bit types
    if trimmed.starts_with("bit&") {
        return false;
    }

    // Exclude special types (they have their own processing rules)
    if SPECIAL_TYPES.contains(&trimmed) {
        return false;
    }

    // Check for custom type patterns
    if CUSTOM_TYPE_PATTERNS
        .iter()
        .any(|pattern| trimmed.contains(pattern))
    {
        return true;
    }

    // Check if it starts with uppercase (likely custom type)
    trimmed.chars().next().is_some_and(|c| c.is_uppercase())
}

/// Checks if a type string is a special type that needs unique processing
pub fn is_special_type(type_str: &str) -> bool {
    SPECIAL_TYPES.contains(&type_str.trim())
}

/// Parses bit type string (e.g., "bit&01") and returns the bit value
pub fn parse_bit_value(bit_str: &str) -> Result<u8, SchemaError> {
    bit_str
        .strip_prefix("bit&")
        .and_then(|s| u8::from_str_radix(s, 16).ok())
        .ok_or_else(|| SchemaError::InvalidBitValue {
            input: bit_str.to_string(),
        })
}

/// Extracts schema name from file path
pub fn extract_schema_name_from_path(path: &std::path::Path) -> Option<String> {
    path.file_stem()
        .and_then(|name| name.to_str())
        .map(|name| name.to_string())
}

/// Analyzes a CSV file to find missing custom type files
pub fn analyze_missing_files<P: AsRef<Path>>(file_path: P) -> Result<Vec<String>, SchemaError> {
    let path = file_path.as_ref();
    let base_dir = path.parent().unwrap_or(Path::new("."));

    let file = std::fs::File::open(path)?;
    let mut rdr = csv::ReaderBuilder::new()
        .has_headers(false)
        .from_reader(file);

    let mut records = rdr.records();

    // Skip field names (first row) and descriptions (second row)
    records.next();
    records.next();

    // Read field types (third row)
    if let Some(field_types) = records.next() {
        let field_types = field_types?;
        Ok(find_missing_files_in_types(&field_types, base_dir))
    } else {
        Ok(vec![])
    }
}

/// Finds missing custom type files from field types
pub fn find_missing_files_in_types(
    field_types: &csv::StringRecord,
    base_dir: &Path,
) -> Vec<String> {
    field_types
        .iter()
        .filter_map(|type_str| {
            let trimmed = type_str.trim();
            if is_likely_custom_type(trimmed) && !file_exists(base_dir, trimmed) {
                Some(trimmed.to_string())
            } else {
                None
            }
        })
        .collect()
}

/// Checks if a CSV file exists for the given type name
pub fn file_exists(base_dir: &Path, type_name: &str) -> bool {
    base_dir.join(format!("{}.csv", type_name)).exists()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_likely_custom_type() {
        // Basic types should return false
        assert!(!is_likely_custom_type("str"));
        assert!(!is_likely_custom_type("int32"));
        assert!(!is_likely_custom_type("bool"));
        assert!(!is_likely_custom_type("bit&01"));

        // Special types should return false (they have their own processing)
        assert!(!is_likely_custom_type("Image"));
        assert!(!is_likely_custom_type("Row"));
        assert!(!is_likely_custom_type("Key"));
        assert!(!is_likely_custom_type("Color"));

        // Custom types should return true
        assert!(is_likely_custom_type("ItemCategory"));
        assert!(is_likely_custom_type("ClassJob"));
    }

    #[test]
    fn test_is_special_type() {
        // Special types should return true
        assert!(is_special_type("Image"));
        assert!(is_special_type("Row"));
        assert!(is_special_type("Key"));
        assert!(is_special_type("Color"));

        // Basic and custom types should return false
        assert!(!is_special_type("str"));
        assert!(!is_special_type("int32"));
        assert!(!is_special_type("ItemCategory"));
        assert!(!is_special_type("bit&01"));
    }

    #[test]
    fn test_parse_bit_value() {
        assert!(matches!(parse_bit_value("bit&01"), Ok(1)));
        assert!(matches!(parse_bit_value("bit&02"), Ok(2)));
        assert!(matches!(parse_bit_value("bit&FF"), Ok(255)));
        assert!(parse_bit_value("invalid").is_err());
        assert!(parse_bit_value("bit&").is_err());
        assert!(parse_bit_value("bit&GG").is_err());

        // Test specific error message for invalid input
        if let Err(SchemaError::InvalidBitValue { input }) = parse_bit_value("invalid") {
            assert_eq!(input, "invalid");
        } else {
            panic!("Expected InvalidBitValue error");
        }
    }

    #[test]
    fn test_find_missing_files_in_types() {
        // Create a mock StringRecord
        let record = csv::StringRecord::from(vec!["str", "int32", "CustomType", "bool"]);
        let base_dir = Path::new(".");

        let missing_files = find_missing_files_in_types(&record, base_dir);

        // CustomType should be detected as missing (assuming the file doesn't exist)
        assert!(missing_files.contains(&"CustomType".to_string()));
        // Basic types should not be in the missing files
        assert!(!missing_files.contains(&"str".to_string()));
        assert!(!missing_files.contains(&"int32".to_string()));
        assert!(!missing_files.contains(&"bool".to_string()));
    }

    #[test]
    fn test_file_exists() {
        // Test with a file that likely doesn't exist
        assert!(!file_exists(Path::new("."), "NonExistentType"));

        // Test with current directory (should exist)
        assert!(Path::new(".").exists());
    }

    #[test]
    fn test_color_type_not_treated_as_custom() {
        // Create a mock StringRecord with Color type
        let record = csv::StringRecord::from(vec!["str", "int32", "Color", "bool"]);
        let base_dir = Path::new(".");

        let missing_files = find_missing_files_in_types(&record, base_dir);

        // Color should not be treated as a missing custom type
        assert!(!missing_files.contains(&"Color".to_string()));
        // Basic types should not be in the missing files
        assert!(!missing_files.contains(&"str".to_string()));
        assert!(!missing_files.contains(&"int32".to_string()));
        assert!(!missing_files.contains(&"bool".to_string()));
    }

    #[test]
    fn test_mixed_types_with_color() {
        // Create a mock StringRecord mixing special types with custom types
        let record = csv::StringRecord::from(vec!["str", "Color", "Image", "CustomType", "Row", "Key"]);
        let base_dir = Path::new(".");

        let missing_files = find_missing_files_in_types(&record, base_dir);

        // Only CustomType should be detected as missing
        assert!(missing_files.contains(&"CustomType".to_string()));
        
        // Special types should not be treated as missing
        assert!(!missing_files.contains(&"Color".to_string()));
        assert!(!missing_files.contains(&"Image".to_string()));
        assert!(!missing_files.contains(&"Row".to_string()));
        assert!(!missing_files.contains(&"Key".to_string()));
        
        // Basic type should not be treated as missing
        assert!(!missing_files.contains(&"str".to_string()));
    }
}
