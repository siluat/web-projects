mod cli;
mod constants;
mod schema;

use clap::Parser;
use cli::Cli;
use schema::{SchemaBuilder, SchemaError, TypeScriptGenerator, analyze_missing_files};

fn main() {
    let cli = Cli::parse();

    print_configuration(&cli);

    match build_schemas(&cli) {
        Ok(main_schema_name) => {
            print_success(&main_schema_name);
        }
        Err(e) => {
            print_error(&e);
            if let SchemaError::FileNotFound { .. } = e {
                suggest_missing_files(&cli);
            }
            std::process::exit(1);
        }
    }
}

fn print_configuration(cli: &Cli) {
    println!("input_file_path: {:?}", cli.input_file_path);
    println!("output_dir_path: {:?}", cli.output_dir_path);
}

fn build_schemas(cli: &Cli) -> Result<String, SchemaError> {
    let mut schema_builder = SchemaBuilder::new();
    let main_schema_name = schema_builder.build_and_print_schemas(&cli.input_file_path)?;

    // Generate TypeScript interfaces after successful schema building
    let generator = TypeScriptGenerator::new();
    let output_path = cli.output_dir_path.join("schemas.ts");
    if let Err(e) = generator.generate_and_save(schema_builder.get_all_schemas(), &output_path) {
        eprintln!("Warning: Failed to generate TypeScript interfaces: {}", e);
    } else {
        println!("TypeScript interfaces generated: {}", output_path.display());
    }

    Ok(main_schema_name)
}

fn print_success(schema_name: &str) {
    println!("Successfully built schema: {}", schema_name);
}

fn print_error(error: &SchemaError) {
    eprintln!("Error: {}", error);

    if let SchemaError::FileNotFound { path } = error {
        eprintln!("\nRequired file not found: {}", path);
        eprintln!(
            "Make sure all referenced CSV files exist in the same directory as the input file."
        );
    }
}

fn suggest_missing_files(cli: &Cli) {
    match analyze_missing_files(&cli.input_file_path) {
        Ok(missing_files) if !missing_files.is_empty() => {
            eprintln!("\nSuggested files to create:");
            for file in missing_files {
                eprintln!("  - {}.csv", file);
            }
        }
        Err(e) => eprintln!("Could not analyze input file for suggestions: {}", e),
        _ => {} // No missing files
    }
}
