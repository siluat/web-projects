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
            if let SchemaError::InvalidFormat { .. } = e {
                print_csv_format_guidance();
            }
            std::process::exit(1);
        }
    }
}

fn print_configuration(cli: &Cli) {
    println!("input_file_path: {:?}", cli.input_file_path);
    println!("output_file_path: {:?}", cli.output_file_path);
}

fn build_schemas(cli: &Cli) -> Result<String, SchemaError> {
    let mut schema_builder = SchemaBuilder::new();
    let main_schema_name = schema_builder.build_and_print_schemas(&cli.input_file_path)?;

    // Generate TypeScript interfaces after successful schema building
    let generator = TypeScriptGenerator::new();
    generator.generate_and_save(schema_builder.get_all_schemas(), &cli.output_file_path)?;
    println!(
        "TypeScript interfaces generated: {}",
        cli.output_file_path.display()
    );

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

fn print_csv_format_guidance() {
    eprintln!("");
    eprintln!("CSV format example:");
    eprintln!("----------------------");
    eprintln!("key,0,1,2");
    eprintln!("#,Name,Level,IsActive");
    eprintln!("int32,str,byte,bool");
    eprintln!("1,\"Test\",10,true");
    eprintln!("");
    eprintln!("- The first row must start with 'key' and contains field indices/names.");
    eprintln!("- The second row must start with '#' and contains field descriptions.");
    eprintln!("- The third row contains field types (e.g., str, int32, etc.).");
    eprintln!("- Data rows start from the fourth row.");
    eprintln!("");
    eprintln!("See docs/schema-generation-process.md for detailed format rules.");
}
