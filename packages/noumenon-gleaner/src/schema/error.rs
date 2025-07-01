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

    #[error("Invalid bit value format: {input}")]
    InvalidBitValue { input: String },

    #[error("Required CSV header not found: {header}")]
    MissingCsvHeader { header: String },

    #[error("Invalid CSV structure: found multiple {header} rows")]
    DuplicateCsvHeader { header: String },
}
