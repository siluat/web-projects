mod cli;

use clap::Parser;
use cli::Cli;

fn main() {
    let cli = Cli::parse();

    println!("input_file_path: {:?}", cli.input_file_path);
    println!("output_dir_path: {:?}", cli.output_dir_path);

    // TODO: Read input file
    // TODO: Extract schema and data from input file
    // TODO: Write schema and data to output directory
}
