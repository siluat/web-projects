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
