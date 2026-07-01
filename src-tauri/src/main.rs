// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::json;

use crate::{auth::license::token_setup, versions::available::get_available_versions};

mod auth;
mod settings;
mod types;
mod versions;

#[tokio::main]
async fn main() {
    let settings = settings::Settings::new();
    let folder = settings.get_data_folder_path();
    println!("{}", folder);
    let client = reqwest::ClientBuilder::new().build().unwrap();
    let tokens = token_setup(&client).await;

    auth::license::login(&client, &tokens).await;
    let versions = get_available_versions(&client).await;
    match versions {
        Ok(value) => {
            //println!("{}", json!(value));
        }
        Err(error) => {
            println!("{}", error);
        }
    }
    //auth::license::get_key(&client, &tokens, false).await;
    launcherpah_lib::run();
}
