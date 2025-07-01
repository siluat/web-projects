use std::collections::HashMap;

// Constants for Image processing
const IMAGE_PADDING_LENGTH: usize = 6;
const IMAGE_FOLDER_PREFIX_LENGTH: usize = 3;
const IMAGE_FOLDER_SUFFIX: &str = "000";
const IMAGE_FILE_EXTENSION: &str = ".png";

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
    Image, // UI image file path with special processing rules
    Row,   // Row type

    // Custom types that reference other CSV files
    Custom(String),
}

impl FieldType {
    /// Process Image type value according to game data rules:
    /// - Input must be 1-6 digits
    /// - Pad input to 6 digits with leading zeros
    /// - Replace last 3 digits with "000" for folder name
    /// - Add .png extension for file name
    ///
    /// # Examples
    /// ```
    /// use noumenon_gleaner::schema::types::FieldType;
    ///
    /// assert_eq!(
    ///     FieldType::process_image_path("1000"),
    ///     Some("001000/001000.png".to_string())
    /// );
    /// assert_eq!(
    ///     FieldType::process_image_path("65002"),
    ///     Some("065000/065002.png".to_string())
    /// );
    /// ```
    pub fn process_image_path(raw_value: &str) -> Option<String> {
        let image_id = Self::parse_and_validate_image_id(raw_value)?;
        let padded_id = Self::pad_image_id(image_id);
        let folder_name = Self::generate_folder_name(&padded_id);
        let file_name = Self::generate_file_name(&padded_id);

        Some(format!("{}/{}", folder_name, file_name))
    }

    /// Parse and validate the raw image ID value
    fn parse_and_validate_image_id(raw_value: &str) -> Option<u32> {
        let trimmed = raw_value.trim();

        // Handle empty or "0" values
        if trimmed.is_empty() || trimmed == "0" {
            return None;
        }

        // Must be 1-6 digits
        if trimmed.len() > IMAGE_PADDING_LENGTH {
            return None;
        }

        // Parse as number to validate it's a valid number
        trimmed.parse::<u32>().ok()
    }

    /// Pad the image ID to 6 digits with leading zeros
    fn pad_image_id(image_id: u32) -> String {
        format!("{:0width$}", image_id, width = IMAGE_PADDING_LENGTH)
    }

    /// Generate folder name from padded image ID
    fn generate_folder_name(padded_id: &str) -> String {
        format!(
            "{}{}",
            &padded_id[..IMAGE_FOLDER_PREFIX_LENGTH],
            IMAGE_FOLDER_SUFFIX
        )
    }

    /// Generate file name from padded image ID
    fn generate_file_name(padded_id: &str) -> String {
        format!("{}{}", padded_id, IMAGE_FILE_EXTENSION)
    }

    /// Process Row type value according to game data rules
    /// TODO: Implement Row type processing logic in next phase
    #[allow(dead_code)]
    pub fn process_row_value(raw_value: &str) -> Option<String> {
        // TODO: Determine the exact processing rules for Row type
        // For now, just return the raw value as-is
        let trimmed = raw_value.trim();
        if trimmed.is_empty() || trimmed == "0" {
            None
        } else {
            Some(trimmed.to_string())
        }
    }
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

    mod image_processing_tests {
        use super::*;

        #[test]
        fn test_valid_padding_cases() {
            // 6-digit number (no padding needed)
            assert_eq!(
                FieldType::process_image_path("021001"),
                Some("021000/021001.png".to_string())
            );

            // 5-digit numbers (real examples from fixtures)
            assert_eq!(
                FieldType::process_image_path("65002"),
                Some("065000/065002.png".to_string())
            );
            assert_eq!(
                FieldType::process_image_path("20001"),
                Some("020000/020001.png".to_string())
            );

            // 4-digit number
            assert_eq!(
                FieldType::process_image_path("1234"),
                Some("001000/001234.png".to_string())
            );

            // Shorter numbers
            assert_eq!(
                FieldType::process_image_path("123"),
                Some("000000/000123.png".to_string())
            );
            assert_eq!(
                FieldType::process_image_path("12"),
                Some("000000/000012.png".to_string())
            );
            assert_eq!(
                FieldType::process_image_path("1"),
                Some("000000/000001.png".to_string())
            );
        }

        #[test]
        fn test_edge_cases() {
            // Leading zeros in input (should be preserved in meaning)
            assert_eq!(
                FieldType::process_image_path("000123"),
                Some("000000/000123.png".to_string())
            );

            // With whitespace
            assert_eq!(
                FieldType::process_image_path("  65002  "),
                Some("065000/065002.png".to_string())
            );

            // Maximum 6-digit value
            assert_eq!(
                FieldType::process_image_path("999999"),
                Some("999000/999999.png".to_string())
            );

            // Common example
            assert_eq!(
                FieldType::process_image_path("1000"),
                Some("001000/001000.png".to_string())
            );
        }

        #[test]
        fn test_invalid_input_cases() {
            // Empty and zero values
            assert_eq!(FieldType::process_image_path(""), None);
            assert_eq!(FieldType::process_image_path("0"), None);
            assert_eq!(FieldType::process_image_path("   "), None);

            // Too many digits
            assert_eq!(FieldType::process_image_path("1234567"), None);
            assert_eq!(FieldType::process_image_path("12345678"), None);
            assert_eq!(FieldType::process_image_path("999999999"), None);

            // Non-numeric values
            assert_eq!(FieldType::process_image_path("abc123"), None);
            assert_eq!(FieldType::process_image_path("123abc"), None);
            assert_eq!(FieldType::process_image_path("abcdef"), None);
            assert_eq!(FieldType::process_image_path("12a456"), None);

            // Invalid formats
            assert_eq!(FieldType::process_image_path("-123456"), None);
            assert_eq!(FieldType::process_image_path("123.456"), None);
            assert_eq!(FieldType::process_image_path("123-456"), None);
            assert_eq!(FieldType::process_image_path("123_456"), None);
        }

        #[test]
        fn test_helper_functions() {
            // Test parse_and_validate_image_id
            assert_eq!(FieldType::parse_and_validate_image_id("12345"), Some(12345));
            assert_eq!(FieldType::parse_and_validate_image_id("0"), None);
            assert_eq!(FieldType::parse_and_validate_image_id("1234567"), None);
            assert_eq!(FieldType::parse_and_validate_image_id("abc"), None);

            // Test pad_image_id
            assert_eq!(FieldType::pad_image_id(123), "000123");
            assert_eq!(FieldType::pad_image_id(123456), "123456");

            // Test generate_folder_name
            assert_eq!(FieldType::generate_folder_name("123456"), "123000");
            assert_eq!(FieldType::generate_folder_name("000123"), "000000");

            // Test generate_file_name
            assert_eq!(FieldType::generate_file_name("123456"), "123456.png");
            assert_eq!(FieldType::generate_file_name("000123"), "000123.png");
        }
    }

    mod row_processing_tests {
        use super::*;

        #[test]
        fn test_process_row_value_placeholder() {
            // TODO: Update these tests when Row processing logic is implemented

            // Basic cases (current placeholder behavior)
            assert_eq!(FieldType::process_row_value("123"), Some("123".to_string()));
            assert_eq!(FieldType::process_row_value("1"), Some("1".to_string()));

            // Empty/zero cases
            assert_eq!(FieldType::process_row_value(""), None);
            assert_eq!(FieldType::process_row_value("0"), None);
            assert_eq!(FieldType::process_row_value("   "), None);

            // With whitespace
            assert_eq!(
                FieldType::process_row_value("  123  "),
                Some("123".to_string())
            );
        }
    }
}
