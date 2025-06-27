use thiserror::Error;

#[derive(Error, Debug)]
pub enum SchemaError {
    #[error("File not found: {path}")]
    FileNotFound { path: String },

    #[error("CSV parsing error: {0}")]
    CsvError(#[from] csv::Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Invalid CSV format: {reason}")]
    InvalidFormat { reason: String },

    #[error("Circular dependency detected: {chain}")]
    CircularDependency { chain: String },
}
