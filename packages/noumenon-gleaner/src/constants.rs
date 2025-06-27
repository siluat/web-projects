/// Basic type names that should not be treated as custom types
pub const BASIC_TYPES: &[&str] = &[
    "str", "int32", "uint32", "int16", "uint16", "byte", "sbyte", "float", "bool",
];

/// Patterns that indicate a type is likely a custom type
pub const CUSTOM_TYPE_PATTERNS: &[&str] = &[
    "Category", "Action", "Level", "Param", "Job", "Company", "Series",
];

/// Special type names that are always considered custom types
pub const SPECIAL_CUSTOM_TYPES: &[&str] = &["Image", "Row"];

/// CSV parsing constants
pub const FIELD_NAMES_ROW: usize = 0;
pub const FIELD_DESCRIPTIONS_ROW: usize = 1;
pub const FIELD_TYPES_ROW: usize = 2;
