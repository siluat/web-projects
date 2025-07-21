/// Basic type names that should not be treated as custom types
pub const BASIC_TYPES: &[&str] = &[
    "str", "int32", "uint32", "int16", "uint16", "byte", "sbyte", "float", "bool",
];

/// Patterns that indicate a type is likely a custom type
pub const CUSTOM_TYPE_PATTERNS: &[&str] = &[
    "Category", "Action", "Level", "Param", "Job", "Company", "Series",
];

/// Special type names that have unique processing rules
pub const SPECIAL_TYPES: &[&str] = &["Image", "Row", "Key", "Color"];

/// Header indicators for CSV row detection
pub const FIELD_NAMES_HEADER: &str = "key";
pub const FIELD_DESCRIPTIONS_HEADER: &str = "#";
// Field types header will be detected by checking if first column matches any BASIC_TYPES
